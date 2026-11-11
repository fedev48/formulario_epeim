<?php
/**
 * Feed de Instagram para la sección "Novedades" del sitio.
 *
 * - Usa la Instagram API with Instagram Login (token de larga duración, 60 días).
 * - El token y el caché viven FUERA de la carpeta pública (ver IG_PRIVADO).
 * - Cachea los posteos IG_CACHE_SEGUNDOS y descarga las imágenes a /ig/ para no depender
 *   de las URLs del CDN de Instagram, que vencen.
 * - Renueva el token cada IG_RENOVAR_CADA segundos aprovechando las visitas (sin cron).
 * - Los posteos con IG_HASHTAG en el texto van primero (hasta IG_MAX_DESTACADOS); el resto
 *   se completa con los más recientes. La API no informa qué posteos están fijados.
 * - Si algo falla, devuelve el último feed bueno; si no hay ninguno, {"posts": []} y el
 *   front muestra el placeholder.
 *
 * Compatible con PHP 7.4+. Necesita curl o allow_url_fopen; GD es opcional (achica imágenes).
 */

declare(strict_types=1);

// Es un endpoint JSON: los avisos de PHP van al log del servidor, nunca a la respuesta.
ini_set('display_errors', '0');

const IG_CANTIDAD = 4;
const IG_CACHE_SEGUNDOS = 3 * 3600;
const IG_REINTENTO_SEGUNDOS = 15 * 60;
const IG_RENOVAR_CADA = 7 * 86400;
const IG_VIDA_TOKEN = 60 * 86400;
const IG_AVISO_DIAS = 10;
const IG_API = 'https://graph.instagram.com';
const IG_VERSION = ''; // Ej.: 'v23.0'. Vacío = la versión por defecto de la app.
const IG_EMAIL_AVISO = ''; // Opcional: a quién avisar si el token está por vencer y no se pudo renovar.
const IG_ANCHO_IMAGEN = 640;
const IG_HASHTAG = 'destacadoweb'; // sin '#'. Para destacar un posteo, agregarlo a su texto en Instagram.
const IG_MAX_DESTACADOS = 3;
const IG_REVISAR = 100; // cuántos posteos recientes se revisan buscando el hashtag

// public_html/api/instagram.php -> <raíz de la cuenta>/epeim-private/instagram
define('IG_PRIVADO', getenv('EPEIM_IG_PRIVADO') ?: dirname(__DIR__, 2) . '/epeim-private/instagram');
define('IG_TOKEN', IG_PRIVADO . '/token.json');
define('IG_FEED', IG_PRIVADO . '/feed.json');
define('IG_LOCK', IG_PRIVADO . '/instagram.lock');
define('IG_LOG', IG_PRIVADO . '/instagram.log');
define('IG_IMAGENES', dirname(__DIR__) . '/ig');

if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) {
    responder(['posts' => []], 405);
}

$feed = leerJson(IG_FEED);
if ($feed && time() - (int)($feed['generado'] ?? 0) < IG_CACHE_SEGUNDOS) {
    responder($feed);
}

// Un solo proceso actualiza; los demás devuelven lo que haya.
$lock = @fopen(IG_LOCK, 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
    responder($feed ?: ['posts' => []]);
}

$estado = 200;
try {
    $token = leerJson(IG_TOKEN);
    if (!$token || empty($token['access_token'])) {
        throw new RuntimeException('Falta token.json o no tiene access_token.');
    }
    $token = renovarSiHaceFalta($token);
    $posts = pedirPosts($token['access_token']);
    if (!$posts && $feed) {
        throw new RuntimeException('Instagram no devolvió posteos con imagen.');
    }
    $feed = ['generado' => time(), 'posts' => $posts];
    escribirJson(IG_FEED, $feed);
    limpiarImagenes(array_column($posts, 'id'));
} catch (Throwable $e) {
    registrar('Error al actualizar el feed: ' . $e->getMessage());
    if ($feed) {
        // Se sigue sirviendo el feed anterior y se reintenta en unos minutos.
        $feed['generado'] = time() - IG_CACHE_SEGUNDOS + IG_REINTENTO_SEGUNDOS;
        escribirJson(IG_FEED, $feed);
    } else {
        $estado = 503;
    }
}
flock($lock, LOCK_UN);
fclose($lock);
responder($feed ?: ['posts' => []], $estado);


function renovarSiHaceFalta(array $token): array
{
    $ahora = time();
    if (empty($token['refreshed_at'])) {
        // Primer uso: se toma la fecha del archivo como fecha de emisión del token.
        $token['refreshed_at'] = @filemtime(IG_TOKEN) ?: $ahora;
        $token['expires_at'] = $token['refreshed_at'] + IG_VIDA_TOKEN;
        escribirJson(IG_TOKEN, $token);
    }
    if ($ahora - (int)$token['refreshed_at'] < IG_RENOVAR_CADA) {
        return $token;
    }

    try {
        $respuesta = pedirJson(IG_API . '/refresh_access_token?' . http_build_query([
            'grant_type' => 'ig_refresh_token',
            'access_token' => $token['access_token'],
        ]));
        if (empty($respuesta['access_token'])) {
            throw new RuntimeException('La respuesta no trae access_token.');
        }
        $token = [
            'access_token' => $respuesta['access_token'],
            'refreshed_at' => $ahora,
            'expires_at' => $ahora + (int)($respuesta['expires_in'] ?? IG_VIDA_TOKEN),
        ];
        escribirJson(IG_TOKEN, $token);
        registrar('Token renovado. Vence el ' . date('Y-m-d', $token['expires_at']) . '.');
    } catch (Throwable $e) {
        registrar('No se pudo renovar el token: ' . $e->getMessage());
        avisarSiVence($token);
    }
    return $token;
}

function avisarSiVence(array &$token): void
{
    $quedan = (int)($token['expires_at'] ?? 0) - time();
    if (IG_EMAIL_AVISO === '' || $quedan > IG_AVISO_DIAS * 86400) {
        return;
    }
    if (time() - (int)($token['aviso_at'] ?? 0) < 86400) {
        return; // como mucho un aviso por día
    }
    $dias = max(0, intdiv($quedan, 86400));
    @mail(
        IG_EMAIL_AVISO,
        'Sitio EPEIM: el token de Instagram vence en ' . $dias . ' días',
        "No se pudo renovar automáticamente el token de Instagram del sitio.\n" .
        "Generá uno nuevo en Meta for Developers y reemplazá epeim-private/instagram/token.json.\n" .
        "Detalle en epeim-private/instagram/instagram.log."
    );
    $token['aviso_at'] = time();
    escribirJson(IG_TOKEN, $token);
}

function pedirPosts(string $accessToken): array
{
    $version = IG_VERSION !== '' ? '/' . IG_VERSION : '';
    $respuesta = pedirJson(IG_API . $version . '/me/media?' . http_build_query([
        'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
        'limit' => IG_REVISAR,
        'access_token' => $accessToken,
    ]));

    if (!is_dir(IG_IMAGENES) && !@mkdir(IG_IMAGENES, 0755, true)) {
        throw new RuntimeException('No se pudo crear la carpeta de imágenes.');
    }

    // Primero los que tienen el hashtag (más nuevos primero), después el resto por fecha.
    $patron = '/(?<![\\p{L}\\p{N}_])#' . preg_quote(IG_HASHTAG, '/') . '(?![\\p{L}\\p{N}_])/iu';
    $destacados = [];
    $recientes = [];
    foreach ($respuesta['data'] ?? [] as $media) {
        if (count($destacados) < IG_MAX_DESTACADOS && preg_match($patron, (string)($media['caption'] ?? ''))) {
            $destacados[] = $media;
        } else {
            $recientes[] = $media;
        }
    }

    $posts = [];
    foreach (array_merge($destacados, $recientes) as $media) {
        if (count($posts) >= IG_CANTIDAD) {
            break;
        }
        $esDestacado = in_array($media, $destacados, true);
        $tipo = (string)($media['media_type'] ?? '');
        $fuente = $tipo === 'VIDEO' ? ($media['thumbnail_url'] ?? null) : ($media['media_url'] ?? null);
        $id = preg_replace('/\D/', '', (string)($media['id'] ?? ''));
        $permalink = (string)($media['permalink'] ?? '');
        if (!$fuente || $id === '' || strpos($permalink, 'https://www.instagram.com/') !== 0) {
            continue;
        }
        $archivo = IG_IMAGENES . '/' . $id . '.jpg';
        if (!is_file($archivo) && !descargarImagen((string)$fuente, $archivo)) {
            if ($esDestacado) {
                registrar('Un posteo destacado no tiene imagen utilizable (' . $permalink . '): se saltea.');
            }
            continue;
        }
        $texto = trim(preg_replace($patron, '', (string)($media['caption'] ?? '')) ?? '');
        $posts[] = [
            'id' => $id,
            'permalink' => $permalink,
            'caption' => recortar($texto, 220),
            'type' => $tipo,
            'image' => '/ig/' . $id . '.jpg',
            // Instagram manda "+0000" (sin dos puntos), que Safari no siempre interpreta: se pasa a ISO 8601.
            'timestamp' => isset($media['timestamp']) ? date(DATE_ATOM, (int)strtotime((string)$media['timestamp'])) : '',
        ];
    }
    return $posts;
}

function descargarImagen(string $url, string $destino): bool
{
    try {
        $datos = pedir($url, 15 * 1024 * 1024);
    } catch (Throwable $e) {
        registrar('No se pudo descargar una imagen: ' . $e->getMessage());
        return false;
    }
    $info = @getimagesizefromstring($datos);
    if (!$info) {
        return false;
    }

    if (function_exists('imagecreatefromstring') && ($origen = @imagecreatefromstring($datos))) {
        if (esImagenLisa($origen)) {
            // Algunos reels traen como portada un cuadro negro: se saltea ese posteo.
            liberarImagen($origen);
            return false;
        }
        [$ancho, $alto] = $info;
        $nuevoAncho = min(IG_ANCHO_IMAGEN, $ancho);
        $nuevoAlto = (int)round($alto * $nuevoAncho / $ancho);
        $lienzo = imagecreatetruecolor($nuevoAncho, $nuevoAlto);
        imagecopyresampled($lienzo, $origen, 0, 0, 0, 0, $nuevoAncho, $nuevoAlto, $ancho, $alto);
        $temporal = $destino . '.tmp';
        $ok = imagejpeg($lienzo, $temporal, 82) && rename($temporal, $destino);
        liberarImagen($origen);
        liberarImagen($lienzo);
        return $ok;
    }
    if ($info[2] !== IMAGETYPE_JPEG) {
        return false; // sin GD solo se guardan JPEG tal cual
    }
    return escribirAtomico($destino, $datos);
}

/** En PHP 7 libera la memoria de la imagen; desde PHP 8 no hace falta (y en 8.5 está deprecada). */
function liberarImagen($imagen): void
{
    if (PHP_VERSION_ID < 80000) {
        imagedestroy($imagen);
    }
}

/** true si la imagen es prácticamente de un solo color (desvío de luminancia muy bajo). */
function esImagenLisa($imagen): bool
{
    $lado = 16;
    $muestra = imagecreatetruecolor($lado, $lado);
    imagecopyresampled($muestra, $imagen, 0, 0, 0, 0, $lado, $lado, imagesx($imagen), imagesy($imagen));
    $valores = [];
    for ($x = 0; $x < $lado; $x++) {
        for ($y = 0; $y < $lado; $y++) {
            $rgb = imagecolorat($muestra, $x, $y);
            $valores[] = 0.299 * (($rgb >> 16) & 0xff) + 0.587 * (($rgb >> 8) & 0xff) + 0.114 * ($rgb & 0xff);
        }
    }
    liberarImagen($muestra);
    $media = array_sum($valores) / count($valores);
    $varianza = array_sum(array_map(fn ($v) => ($v - $media) ** 2, $valores)) / count($valores);
    return sqrt($varianza) < 4;
}

function limpiarImagenes(array $idsVigentes): void
{
    foreach (glob(IG_IMAGENES . '/*.jpg') ?: [] as $archivo) {
        if (!in_array(basename($archivo, '.jpg'), $idsVigentes, true)) {
            @unlink($archivo);
        }
    }
}

function pedirJson(string $url): array
{
    $datos = json_decode(pedir($url, 2 * 1024 * 1024), true);
    if (!is_array($datos)) {
        throw new RuntimeException('Respuesta inválida de Instagram.');
    }
    if (isset($datos['error'])) {
        $mensaje = (string)($datos['error']['message'] ?? 'error desconocido');
        throw new RuntimeException('Instagram: ' . $mensaje);
    }
    return $datos;
}

function pedir(string $url, int $maximo): string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_USERAGENT => 'EPEIM-sitio/1.0',
        ]);
        $cuerpo = curl_exec($ch);
        $codigo = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $error = curl_error($ch);
        if (PHP_VERSION_ID < 80000) {
            curl_close($ch); // desde PHP 8 no hace falta y en 8.5 está deprecada
        }
        if ($cuerpo === false) {
            throw new RuntimeException('Fallo de conexión: ' . $error);
        }
    } else {
        $contexto = stream_context_create(['http' => ['timeout' => 15, 'ignore_errors' => true, 'user_agent' => 'EPEIM-sitio/1.0']]);
        $cuerpo = @file_get_contents($url, false, $contexto, 0, $maximo + 1);
        if ($cuerpo === false) {
            throw new RuntimeException('Fallo de conexión.');
        }
        $codigo = 200;
        foreach ($http_response_header ?? [] as $linea) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $linea, $m)) {
                $codigo = (int)$m[1];
            }
        }
    }
    if (strlen($cuerpo) > $maximo) {
        throw new RuntimeException('Respuesta demasiado grande.');
    }
    if ($codigo >= 400 && strpos(ltrim($cuerpo), '{') !== 0) {
        throw new RuntimeException('HTTP ' . $codigo);
    }
    return $cuerpo;
}

function recortar(string $texto, int $largo): string
{
    $texto = trim(preg_replace('/\s+/u', ' ', $texto) ?? '');
    if (mb_strlen($texto) <= $largo) {
        return $texto;
    }
    return rtrim(mb_substr($texto, 0, $largo - 1)) . '…';
}

function leerJson(string $ruta): ?array
{
    if (!is_file($ruta)) {
        return null;
    }
    $datos = json_decode((string)@file_get_contents($ruta), true);
    return is_array($datos) ? $datos : null;
}

function escribirJson(string $ruta, array $datos): void
{
    if (!escribirAtomico($ruta, json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT))) {
        throw new RuntimeException('No se pudo escribir ' . basename($ruta) . '.');
    }
}

function escribirAtomico(string $ruta, string $contenido): bool
{
    $temporal = $ruta . '.' . getmypid() . '.tmp';
    if (@file_put_contents($temporal, $contenido, LOCK_EX) === false) {
        return false;
    }
    @chmod($temporal, 0640);
    return @rename($temporal, $ruta);
}

function registrar(string $mensaje): void
{
    $linea = date('c') . ' ' . $mensaje . PHP_EOL;
    if (@file_put_contents(IG_LOG, $linea, FILE_APPEND | LOCK_EX) === false) {
        error_log('[instagram.php] ' . $mensaje);
    }
}

function responder(array $feed, int $estado = 200): void
{
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: ' . ($estado === 200 ? 'public, max-age=1800' : 'no-store'));
    $salida = [
        'posts' => array_values($feed['posts'] ?? []),
        'actualizado' => isset($feed['generado']) ? date('c', (int)$feed['generado']) : null,
    ];
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
        echo json_encode($salida, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
    exit;
}

// Logos del header incrustados en el HTML (pesan pocos KB). Así se ven desde el primer instante
// aunque la red esté lenta, y las transiciones entre páginas siempre los tienen listos.
import sharp from 'sharp';
import { join } from 'node:path';

export type LogoInline = { src: string; width: number; height: number };

const cache = new Map<string, Promise<LogoInline>>();

export function logoInline(nombre: 'epeim' | 'pasitos'): Promise<LogoInline> {
  if (!cache.has(nombre)) {
    cache.set(
      nombre,
      (async () => {
        // 112 px de alto: el doble de los 56 px en los que se muestra, para pantallas de alta densidad.
        const { data, info } = await sharp(join(process.cwd(), 'src/assets/logos', `${nombre}.png`))
          .resize({ height: 112 })
          .webp({ quality: 90, alphaQuality: 100 })
          .toBuffer({ resolveWithObject: true });
        return { src: `data:image/webp;base64,${data.toString('base64')}`, width: info.width, height: info.height };
      })(),
    );
  }
  return cache.get(nombre)!;
}

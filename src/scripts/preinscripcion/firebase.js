// Integración con Firebase: misma app, misma base y mismo registro que el formulario original
// (Contenido/Forma inscripción/index.html). El Google Apps Script lee `students/` y espera
// exactamente estos 5 campos: no agregar, quitar ni renombrar.
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import { getDatabase, connectDatabaseEmulator, ref, set, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCly-YdV2qRxb4_E4aTokSrxqdydPR-xbI',
  authDomain: 'formulario-de-pre-inscrip-db.firebaseapp.com',
  databaseURL: 'https://formulario-de-pre-inscrip-db-default-rtdb.firebaseio.com',
  projectId: 'formulario-de-pre-inscrip-db',
  storageBucket: 'formulario-de-pre-inscrip-db.appspot.com',
  messagingSenderId: '174126822708',
  appId: '1:174126822708:web:1a098827fcefb81600a161',
  measurementId: 'G-KV6B51EFZ2',
};

// En desarrollo se puede apuntar al emulador: PUBLIC_FIREBASE_EMULATOR=127.0.0.1:9000
const emulador = import.meta.env.PUBLIC_FIREBASE_EMULATOR;

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let appCheck = null;

if (emulador) {
  const [host, port] = emulador.split(':');
  connectDatabaseEmulator(db, host, Number(port));
} else {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LcMp1YqAAAAAKMQaKXkYV07CxsmEBF1MClC2CM_'),
    isTokenAutoRefreshEnabled: true,
  });
}

const MAX_INTENTOS = 30;

const esPermisoDenegado = (error) => /permission[_ ]denied/i.test(`${error?.code ?? ''} ${error?.message ?? ''}`);

// Firebase no acepta . # $ [ ] / en las claves. Antes esos nombres hacían fallar el envío;
// se limpian solo en la clave. El nombre se guarda tal cual en Estudiante_inscripto.
const claveSegura = (nombre) => nombre.replace(/[.#$[\]/\u0000-\u001f\u007f]/g, '').trim() || 'Sin nombre';

// Devuelve true/false si se puede leer, o null si las reglas no permiten leer.
async function existe(ruta) {
  try {
    return (await get(ref(db, ruta))).exists();
  } catch (error) {
    if (esPermisoDenegado(error)) return null;
    throw error;
  }
}

/**
 * Guarda la preinscripción en students/<Nombre Apellido>[n], igual que el formulario original
 * ("", "1", "2"…). Funciona con las reglas actuales (que permiten leer) y con las nuevas
 * (crear sí, leer y modificar no): si no se puede leer, una escritura rechazada significa
 * que la clave ya existe y se prueba con el siguiente sufijo.
 */
export async function guardarPreinscripcion({ studentName, studentLevel, studentCourse, blob }) {
  if (appCheck) {
    try {
      await getToken(appCheck, false);
    } catch (error) {
      console.error('App Check:', error);
    }
  }

  const base = 'students/' + claveSegura(studentName);
  let lecturaPermitida = true;

  for (let i = 0; i < MAX_INTENTOS; i++) {
    const ruta = base + (i === 0 ? '' : String(i));

    if (lecturaPermitida) {
      const yaExiste = await existe(ruta);
      if (yaExiste === true) continue;
      if (yaExiste === null) lecturaPermitida = false;
    }

    try {
      await set(ref(db, ruta), {
        Estudiante_inscripto: studentName,
        Nivel: studentLevel,
        Grado: studentCourse,
        blob: JSON.stringify(blob),
        Fecha: { '.sv': 'timestamp' },
      });
      return ruta;
    } catch (error) {
      if (!lecturaPermitida && esPermisoDenegado(error)) continue;
      throw error;
    }
  }
  throw new Error('No se encontró una clave libre para guardar la preinscripción.');
}

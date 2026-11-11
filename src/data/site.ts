// Datos institucionales. Fuente: Contenido/info.md. No agregar datos que no estén confirmados.

export const site = {
  nombre: 'EPEIM y Jardín Pasitos Curiosos',
  nombreLargo: 'Escuela Privada de Educación Integral Marina (EPEIM) y Jardín de Infantes "Pasitos Curiosos"',
  slogan: 'Dejando huella en nuestros estudiantes desde 1992',
  fundacion: '1992-10-01',
  url: 'https://epeim.com.ar',

  direccion: {
    calle: '12 de Octubre 250',
    ciudad: 'Río Grande',
    provincia: 'Tierra del Fuego',
    pais: 'AR',
    lat: -53.769856,
    lng: -67.705202,
  },
  horarioAtencion: 'De 9 a 18 hs',
  // Celular del colegio: solo WhatsApp (el teléfono fijo ya no existe).
  // wa.me usa el formato internacional de celulares argentinos: 54 + 9 + característica sin 0 + número sin 15.
  whatsapp: { texto: '+54 2964 51-0211', url: 'https://wa.me/5492964510211', internacional: '+5492964510211' },
  email: 'administracion@epeim.com.ar',

  // Pendientes de confirmar (ver info.md): completar y se muestran solos en el sitio.
  instagram: { usuario: 'pasitoscuriososepeim', url: 'https://www.instagram.com/pasitoscuriososepeim/' } as null | { usuario: string; url: string },
  facebook: null as null | { nombre: string; url: string },
};

export const direccionCompleta = `${site.direccion.calle}, ${site.direccion.ciudad}, ${site.direccion.provincia}`;

export const mapa = {
  embed: `https://maps.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&z=16&output=embed`,
  comoLlegar: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccionCompleta + ', Argentina')}`,
};

// Secciones de la home que van en el menú (Inicio y los niveles se agregan aparte).
export const navegacion = [
  { texto: 'Novedades', href: '/#novedades' },
  { texto: 'Historia', href: '/#historia' },
  { texto: 'Contacto', href: '/#contacto' },
];

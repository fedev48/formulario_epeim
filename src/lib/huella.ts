// Dibujo de la huella (pie derecho, viewBox 0 0 40 60). Lo comparten el componente Huella
// y el rastro de pasos de la línea de tiempo.
export const PLANTA =
  'M9 27C8 20 14 16.5 22 16.5S35 20 35 27c0 5-2.6 8-3.6 12.5-.9 4 .8 8-.6 12.3C29.4 56.5 25.6 59 21.4 59c-4.6 0-8.4-3.2-8.4-8.3 0-4.2 2-7 1.6-10.8C14.2 35.6 9.6 33 9 27z';
export const DEDOS = [
  { cx: 13, cy: 8.2, rx: 5, ry: 6 },
  { cx: 22.6, cy: 5.6, rx: 3.3, ry: 3.3 },
  { cx: 29, cy: 7.6, rx: 2.9, ry: 2.9 },
  { cx: 34, cy: 11.4, rx: 2.5, ry: 2.5 },
  { cx: 37.4, cy: 16.6, rx: 2.1, ry: 2.1 },
];

export const huellaSvg = () =>
  `<path d="${PLANTA}"/>` + DEDOS.map((d) => `<ellipse cx="${d.cx}" cy="${d.cy}" rx="${d.rx}" ry="${d.ry}"/>`).join('');

// Mosaico vertical con un pie izquierdo y uno derecho, para usar como fondo repetido.
export const rastroDataUri = (relleno: string) => {
  const pie = huellaSvg();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 72" fill="${relleno}">` +
    `<g transform="translate(22 4) scale(-0.3 0.3)">${pie}</g>` +
    `<g transform="translate(20 40) scale(0.3)">${pie}</g>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

// Huella acostada, con los dedos hacia la derecha (viewBox 0 0 60 40): para rastros que avanzan
// de izquierda a derecha. El pie izquierdo es el espejo del derecho.
export const pisadaSvg = (izquierda: boolean, clase = 'huella-paso', estilo = '') => {
  const pie = izquierda ? `<g transform="translate(40 0) scale(-1 1)">${huellaSvg()}</g>` : huellaSvg();
  return (
    `<svg viewBox="0 0 60 40" class="${clase}" style="${estilo}" fill="currentColor" aria-hidden="true">` +
    `<g transform="translate(60 0) rotate(90)">${pie}</g></svg>`
  );
};

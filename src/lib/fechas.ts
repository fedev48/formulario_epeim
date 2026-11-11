// Años cumplidos desde una fecha ISO (AAAA-MM-DD). Se usa al generar el sitio y en el navegador,
// para que el número del hero cambie solo cada 1 de octubre aunque el sitio no se vuelva a subir.
export const aniosDesde = (iso: string, hoy = new Date()) => {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const yaCumplio = hoy.getMonth() + 1 > mes || (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia);
  return hoy.getFullYear() - anio - (yaCumplio ? 0 : 1);
};

// Las marcas del recorrido cambian según el nivel: huellas en el Jardín, fichas con letras y
// números en la Primaria, nodos conectados en la Secundaria. Antes de elegir, puntos de EPEIM.
import { pisadaSvg } from '../../lib/huella';

const FICHAS = ['ABCDEFGHIJ', '1234567890', 'xyz'];

export function marca(nivel, i, { tramo = 0, texto, clase = '', estilo = '' } = {}) {
  const extra = clase;
  if (!nivel) return `<span class="marca marca-punto ${extra}" aria-hidden="true"></span>`;
  if (nivel === '1') return pisadaSvg(i % 2 === 0, `marca marca-pie ${extra}`, `--y: ${i % 2 ? 3 : -3}px; --i: ${i}; ${estilo}`);
  if (nivel === '2') {
    const letra = texto ?? FICHAS[tramo][i] ?? '·';
    return `<span class="marca marca-ficha ${extra}" style="--i: ${i}; ${estilo}" aria-hidden="true">${letra}</span>`;
  }
  return `<span class="marca marca-nodo ${extra}" style="--i: ${i}; ${estilo}" aria-hidden="true"></span>`;
}

// Rastro animado mientras se envía y rastro de festejo cuando se guardó.
export function pintarExtras(nivel) {
  const cargando = document.querySelector('[data-cargando]');
  const festejo = document.querySelector('[data-festejo]');
  if (!nivel) return;
  const n = (cantidad, f) => Array.from({ length: cantidad }, (_, i) => f(i)).join('');
  if (cargando) {
    cargando.innerHTML =
      nivel === '2'
        ? n(4, (i) => marca(nivel, i, { texto: 'ABCD'[i], clase: 'cargando' }))
        : n(nivel === '1' ? 4 : 5, (i) => marca(nivel, i, { clase: 'cargando' }));
  }
  if (festejo) {
    festejo.innerHTML =
      nivel === '2'
        ? n(7, (i) => marca(nivel, i, { texto: 'GRACIAS'[i], clase: 'festejo' }))
        : n(8, (i) => marca(nivel, i, { clase: 'festejo' }));
  }
}

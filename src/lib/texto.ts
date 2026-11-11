// En los títulos, la coma de Plus Jakarta Sans queda separada de la palabra anterior:
// se envuelve para acercarla. Devuelve HTML, así que escapa el texto primero.
export const acercarComas = (texto: string) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/,/g, '<span class="coma">,</span>');

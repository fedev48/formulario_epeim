// "Tu recorrido": una marca por cada dato obligatorio. Al completar un dato se marca la siguiente.
// Se cuenta con lo que el formulario muestra en cada momento (la sala, el grado o el año aparecen
// según el nivel; cada tutor agregado suma sus datos). Las marcas dependen del nivel (marcas.js).
import { marca, pintarExtras } from './marcas.js';

const obligatorias = (preguntas) => preguntas.filter((q) => q.isVisible && q.isRequired);
const FIRMA = ['signature', 'printed-name'];
const TRAMOS = ['estudiante', 'familia', 'firma'];

// El formulario se muestra en una sola página, así que los tramos se arman por nombre de pregunta.
function tramos(survey) {
  const tutores = survey.getQuestionByName('dynamic-panel-parents');
  const resto = survey.getAllQuestions(true).filter((q) => q !== tutores);
  return {
    estudiante: obligatorias(resto.filter((q) => !FIRMA.includes(q.name))),
    familia: obligatorias(tutores.panels.flatMap((panel) => panel.questions)),
    firma: obligatorias(resto.filter((q) => FIRMA.includes(q.name))),
  };
}

// Ajusta la cantidad de marcas de un rastro y marca las primeras `hechas`.
function pintarRastro(rastro, nivel, tramo, total, hechas) {
  if (rastro.dataset.nivel !== (nivel ?? '')) {
    rastro.replaceChildren();
    rastro.dataset.nivel = nivel ?? '';
  }
  while (rastro.children.length < total) {
    rastro.insertAdjacentHTML('beforeend', marca(nivel, rastro.children.length, { tramo }));
  }
  while (rastro.children.length > total) rastro.lastElementChild.remove();
  [...rastro.children].forEach((m, i) => m.toggleAttribute('data-hecha', i < hechas));
}

export function iniciarRecorrido(survey) {
  let nivelExtras = null;
  const actualizar = () => {
    const nivel = survey.getValue('levell-selection') ?? null;
    if (nivel !== nivelExtras) {
      pintarExtras(nivel);
      nivelExtras = nivel;
    }
    let faltan = 0;
    for (const [nombre, preguntas] of Object.entries(tramos(survey))) {
      const hechas = preguntas.filter((q) => !q.isEmpty()).length;
      faltan += preguntas.length - hechas;
      document.querySelectorAll(`[data-tramo="${nombre}"]`).forEach((tramo) => {
        tramo.toggleAttribute('data-completo', hechas === preguntas.length);
        const cuenta = tramo.querySelector('[data-cuenta]');
        if (cuenta) cuenta.textContent = hechas === preguntas.length ? 'Listo' : `${hechas} de ${preguntas.length}`;
        pintarRastro(tramo.querySelector('[data-rastro]'), nivel, TRAMOS.indexOf(nombre), preguntas.length, hechas);
      });
    }
    document.querySelectorAll('[data-recorrido-resumen]').forEach((resumen) => {
      resumen.textContent = !nivel
        ? 'Empezá eligiendo el nivel.'
        : faltan === 0
          ? '¡Todo listo! Ya podés enviar.'
          : `¡Te ${faltan === 1 ? 'falta 1 dato' : `faltan ${faltan} datos`} para terminar!`;
    });
  };
  survey.onValueChanged.add(actualizar);
  survey.onDynamicPanelAdded.add(actualizar);
  survey.onDynamicPanelRemoved.add(actualizar);
  actualizar();
}

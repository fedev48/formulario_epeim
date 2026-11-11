// Elegir el nivel es lo primero del formulario. Las tarjetas cargan el mismo campo del formulario
// ("levell-selection"), así que aparecen la sala, el grado o el año que correspondan, y la página
// toma los colores y motivos del nivel (window.epeimNivel, definido en la página). Al entrar o salir
// del Jardín, el logo del header gira como una moneda y cambia.
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
const esJardin = (valor) => valor === '1';

export function iniciarNivel(survey) {
  const elegir = document.querySelector('[data-elegir-nivel]');
  const error = document.querySelector('[data-nivel-error]');
  const logo = document.querySelector('[data-header] .header-logo');
  let actual = survey.getValue('levell-selection') ?? null;

  const cuerpo = document.querySelector('[data-cuerpo-formulario]');
  const pista = document.querySelector('[data-pista-nivel]');

  // Hasta elegir el nivel, el formulario se ve gris y no se puede usar (inert). Si pasan 5 s sin
  // elegir, o si tocan el formulario gris, aparece la flechita que señala las tarjetas.
  const mostrarPista = () => {
    if (actual) return;
    pista.hidden = false;
  };
  setTimeout(mostrarPista, 5000);
  cuerpo.addEventListener('click', () => {
    if (actual) return;
    mostrarPista();
    elegir.scrollIntoView({ block: 'center', behavior: reducir.matches ? 'auto' : 'smooth' });
  });

  const mostrar = (valor) => {
    elegir.querySelectorAll('input').forEach((input) => (input.checked = input.value === valor));
    cuerpo.querySelectorAll('[data-hasta-elegir]').forEach((el) => (el.inert = !valor));
    if (valor) {
      marcarError(false);
      pista.hidden = true;
    }
  };
  const marcarError = (hay) => {
    error.hidden = !hay;
    if (hay) elegir.setAttribute('aria-invalid', 'true');
    else elegir.removeAttribute('aria-invalid');
  };

  // El giro del logo usa las mismas clases que la transición entre páginas (global.css). Se aplican al
  // link del logo, así no pisan el achique de la imagen cuando el header está flotando.
  // Cada cambio cancela el giro anterior y solo el último aplica el nivel: si se cambia de tarjeta
  // rápido, la página no queda a medio camino (nivel de una tarjeta, colores de otra).
  const enlaceLogo = logo?.closest('a');
  let turno = 0;

  function cambiar(valor) {
    const id = ++turno;
    actual = valor;
    mostrar(valor);
    // La doble jornada es solo del Jardín: si cambian a otro nivel, se borra el turno elegido.
    if (!esJardin(valor) && survey.getValue('turno') === '3') survey.clearValue('turno');

    if (!enlaceLogo) return window.epeimNivel(valor);
    enlaceLogo.classList.remove('logo-sale', 'logo-entra');
    // Se gira solo si cambia el logo que se ve ahora (el del Jardín o el de EPEIM).
    const jardinVisible = document.documentElement.dataset.nivel === '1';
    if (reducir.matches || esJardin(valor) === jardinVisible) return window.epeimNivel(valor);

    void enlaceLogo.offsetWidth; // reinicia la animación aunque se repita la misma clase
    enlaceLogo.classList.add('logo-sale');
    const [salida] = enlaceLogo.getAnimations();
    // Si un cambio posterior cancela este giro, la promesa se rechaza y no se aplica nada.
    (salida ? salida.finished : Promise.resolve()).then(() => {
      if (id !== turno) return;
      enlaceLogo.classList.remove('logo-sale');
      window.epeimNivel(valor);
      void enlaceLogo.offsetWidth;
      enlaceLogo.classList.add('logo-entra');
    }, () => {});
  }

  elegir.addEventListener('change', (e) => survey.setValue('levell-selection', e.target.value));
  survey.onValueChanged.add((_, opciones) => {
    if (opciones.name === 'levell-selection' && opciones.value !== actual) cambiar(opciones.value ?? null);
  });

  // El campo de nivel del formulario está oculto (lo reemplazan las tarjetas): si se intenta enviar
  // sin elegirlo, el error se muestra en las tarjetas y el foco va a la primera.
  survey.onValidatedErrorsOnCurrentPage.add((_, opciones) => {
    if (!opciones.questions.some((q) => q.name === 'levell-selection')) return;
    marcarError(true);
    setTimeout(() => {
      elegir.scrollIntoView({ block: 'center', behavior: reducir.matches ? 'auto' : 'smooth' });
      elegir.querySelector('input').focus({ preventScroll: true });
    }, 50);
  });

  window.epeimNivel(actual);
  mostrar(actual);
}

// Globo de "Más información" en el aviso de doble jornada: se abre al pasar el mouse o al enfocar,
// y con un toque queda abierto (en el celular no hay mouse). Se cierra con Escape o al salir.
export function iniciarGlobo() {
  const ancla = document.querySelector('[data-globo]');
  if (!ancla) return;
  const boton = ancla.querySelector('button');
  const globo = ancla.querySelector('.globo');
  let fijo = false;
  const abrir = (abierto) => {
    globo.hidden = !abierto;
    boton.setAttribute('aria-expanded', String(abierto));
    if (abierto) {
      // La flecha apunta al botón.
      const caja = globo.getBoundingClientRect();
      const b = boton.getBoundingClientRect();
      globo.style.setProperty('--flecha', `${Math.min(Math.max(b.left + b.width / 2 - caja.left - 6, 16), caja.width - 28)}px`);
    }
  };
  ancla.addEventListener('mouseenter', () => abrir(true));
  ancla.addEventListener('mouseleave', () => !fijo && abrir(false));
  boton.addEventListener('focus', () => abrir(true));
  boton.addEventListener('blur', () => {
    fijo = false;
    abrir(false);
  });
  boton.addEventListener('click', () => {
    fijo = !fijo || globo.hidden;
    abrir(fijo);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !globo.hidden) {
      fijo = false;
      abrir(false);
    }
  });
}

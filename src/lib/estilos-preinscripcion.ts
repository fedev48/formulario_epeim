// Hojas de estilo propias de la preinscripción (la de SurveyJS pesa unos 260 KB). Se enlazan como
// archivos aparte para que las otras páginas puedan precargarlas (ver BaseLayout.astro).
import survey from 'survey-core/defaultV2.fontless.min.css?url';
import propios from '../styles/preinscripcion.css?url';

export const estilosPreinscripcion = [survey, propios];

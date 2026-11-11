// Contenido de los tres niveles. Fuente: Contenido/info.md (perfiles del egresado),
// reorganizado en grupos temáticos. Las salas, grados y años salen del formulario de preinscripción.
import type { ImageMetadata } from 'astro';
import foto1 from '../assets/fotos/foto-1.jpg';
import foto2 from '../assets/fotos/foto-2.jpg';
import foto3 from '../assets/fotos/foto-3.jpg';
import foto4 from '../assets/fotos/foto-4.jpg';
import foto5 from '../assets/fotos/foto-5.jpg';
import foto6 from '../assets/fotos/foto-6.jpg';

export type Foto = { src: ImageMetadata; alt: string };
export type GrupoPerfil = { titulo: string; items: string[] };
export type Nivel = {
  slug: 'nivel-inicial' | 'nivel-primario' | 'nivel-secundario';
  param: 'inicial' | 'primario' | 'secundario';
  nombre: string;
  corto: string; // en el menú de escritorio
  marca: string;
  rango: string;
  resumen: string;
  intro: string[];
  seoTitulo: string;
  seoDescripcion: string;
  banda: 'banda-inicial' | 'banda-primario' | 'banda-secundario';
  fotos: [Foto, ...Foto[]]; // la primera va en la banda y el encabezado; el resto, en la presentación
  perfilTitulo: string;
  perfil: GrupoPerfil[];
};

export const fotos = {
  cumpleanos: { src: foto1, alt: 'Alumnos de Primaria sostienen una bandera pintada con manos de colores que dice "Feliz cumpleaños EPEIM"' },
  gimnasio: { src: foto2, alt: 'Estudiantes de Secundaria reunidos en el gimnasio, en las gradas y en el piso' },
  pintura: { src: foto3, alt: 'Chicos del jardín pintan con rodillos sobre papel de diario' },
  bandera: { src: foto4, alt: 'Chicos del jardín con globos y camisetas argentinas junto a dos muñecos gigantes en un acto por el Día de la Bandera' },
  sala: { src: foto5, alt: 'Chicos del jardín sentados en ronda en su sala de paredes verdes' },
  playa: { src: foto6, alt: 'Alumnos de Primaria y docentes en la costa del mar en Río Grande' },
} satisfies Record<string, Foto>;

export const niveles: Nivel[] = [
  {
    slug: 'nivel-inicial',
    param: 'inicial',
    nombre: 'Nivel Inicial',
    corto: 'Jardín',
    marca: 'Jardín Pasitos Curiosos',
    rango: 'Desde sala de 2 años',
    resumen:
      'El tradicional jardín por el que pasaron miles de niños y niñas de nuestra ciudad. Un espacio para aprender, explorar, expresarse y dar los primeros pasos con autonomía. Desde este nivel, los chicos reciben clases de inglés y música, y realizan actividades relacionadas con el cuidado del ambiente y de los animales.',
    intro: [
      'Pasitos Curiosos nació en 1992 para que Río Grande tuviera un espacio a cargo de profesionales de la educación para los más chicos. Hoy es nuestro Jardín de Infantes.',
      'Es un lugar para jugar, explorar y expresarse de muchas maneras: con el cuerpo, la música, el arte y las primeras palabras en inglés. Cada día es una oportunidad para resolver situaciones, compartir con otros y transformar los obstáculos en aprendizajes.',
    ],
    seoTitulo: 'Jardín de Infantes Pasitos Curiosos en Río Grande',
    seoDescripcion:
      'Jardín de Infantes Pasitos Curiosos en Río Grande, Tierra del Fuego. Salas de 2 a 5 años con juego, arte, inglés y valores. Preinscripción online.',
    banda: 'banda-inicial',
    fotos: [fotos.pintura, fotos.bandera, fotos.sala],
    perfilTitulo: 'Cuando termina el jardín, tu hijo o hija',
    perfil: [
      {
        titulo: 'Gana autonomía',
        items: [
          'Empieza a tomar decisiones para resolver situaciones cotidianas.',
          'Aprende a esperar y a tolerar la frustración, y convierte cada obstáculo en aprendizaje.',
          'Desarrolla sus capacidades motrices.',
        ],
      },
      {
        titulo: 'Explora y se expresa',
        items: [
          'Desarrolla sus posibilidades expresivas en lenguajes diversos.',
          'Es curioso, creativo, crítico y tiene iniciativa para investigar.',
          'Usa tijeras, pinceles, lápices y cuadernos, y herramientas informáticas para la expresión gráfica y artística.',
          'Se acerca al inglés a través del juego.',
        ],
      },
      {
        titulo: 'Convive con otros',
        items: [
          'Tiene empatía con sus compañeros y respeta a los demás y a sí mismo.',
          'Está abierto al diálogo y a resolver problemas intercambiando opiniones.',
          'Vive valores de solidaridad, compañerismo, honestidad y trabajo cooperativo.',
          'Comprende la diversidad y genera inclusión.',
        ],
      },
      {
        titulo: 'Cuida su entorno y su identidad',
        items: [
          'Respeta el ambiente y entiende la necesidad de cuidarlo.',
          'Respeta los símbolos patrios.',
          'Se expresa a través de danzas autóctonas, como parte de su identidad cultural.',
        ],
      },
    ],
  },
  {
    slug: 'nivel-primario',
    param: 'primario',
    nombre: 'Nivel Primario',
    corto: 'Primaria',
    marca: 'Primaria EPEIM',
    rango: 'Bases sólidas para seguir creciendo',
    resumen:
      'Una etapa para aprender a pensar con criterio propio, resolver problemas y comunicar ideas con creatividad. Inglés, tecnología y hábitos de estudio se suman al cuidado del ambiente y la convivencia, para llegar a la Secundaria autónomos y con confianza.',
    intro: [
      'La Primaria abrió en 1999 porque las familias del jardín pidieron que sus hijos pudieran seguir en la escuela. Empezó con un primer grado de 8 alumnos.',
      'Hoy acompaña a los chicos de 1° a 6° grado para que lleguen a la Secundaria con hábitos de estudio, ganas de investigar, una buena base de inglés y tecnología, y valores para convivir con los demás.',
    ],
    seoTitulo: 'Primaria en Río Grande: de 1° a 6° grado',
    seoDescripcion:
      'Primaria de EPEIM en Río Grande, Tierra del Fuego. De 1° a 6° grado con inglés, tecnología, hábitos de estudio y valores. Preinscripción online.',
    banda: 'banda-primario',
    fotos: [fotos.cumpleanos, fotos.playa],
    perfilTitulo: 'Cuando termina la Primaria, tu hijo o hija',
    perfil: [
      {
        titulo: 'Piensa y aprende',
        items: [
          'Usa lo que ya sabe y lo que vivió para construir nuevos aprendizajes.',
          'Resuelve problemas cotidianos y de investigación con razonamiento lógico.',
          'Tiene hábitos y técnicas de estudio, e interés por el trabajo intelectual y la investigación.',
          'Mira el conocimiento con actitud crítica y reflexiva.',
          'Llega preparado a la Secundaria, integrando conocimientos científicos y humanísticos.',
        ],
      },
      {
        titulo: 'Se comunica',
        items: [
          'Se expresa en forma oral, escrita y plástica con claridad, coherencia y creatividad.',
          'Maneja inglés básico y usa las tecnologías de la información para aprender.',
        ],
      },
      {
        titulo: 'Se conoce y se cuida',
        items: [
          'Tiene un concepto positivo de sí mismo y de los demás.',
          'Se valora como persona y respeta su cuerpo y el de los demás, en el marco de la Educación Sexual Integral.',
          'Es optimista frente a las dificultades y está dispuesto a escuchar.',
          'Es puntual, organizado, reflexivo y autónomo.',
        ],
      },
      {
        titulo: 'Convive y cuida su entorno',
        items: [
          'Se integra positivamente en su medio social y natural, y se compromete con el cuidado del ambiente.',
          'Trabaja con acuerdos de convivencia, solo y en grupo.',
          'Vive valores en su relación con adultos y compañeros, con buenos modales y respeto por los símbolos patrios.',
        ],
      },
    ],
  },
  {
    slug: 'nivel-secundario',
    param: 'secundario',
    nombre: 'Nivel Secundario',
    corto: 'Secundaria',
    marca: 'Secundaria EPEIM',
    rango: 'Con orientación en Ciencias Naturales y Ciencias Sociales',
    resumen:
      'Formamos jóvenes críticos, solidarios y autónomos, capaces de liderar proyectos que impactan en su comunidad. Egresan preparados para los estudios superiores y comprometidos con Tierra del Fuego. Preparamos a nuestros estudiantes para rendir los exámenes internacionales de inglés de la Universidad de Cambridge, de los que somos sede oficial.',
    intro: [
      'La Secundaria empezó en 2004 con el nombre EPEIM y orientación en Ciencias Naturales. En 2014 sumó la orientación en Ciencias Sociales.',
      'Desde 2019 trabajamos con el modelo Secundaria 2030: los espacios curriculares se integran en proyectos, y los tiempos y espacios de aprendizaje se vuelven más flexibles.',
    ],
    seoTitulo: 'Secundaria en Río Grande: Naturales y Sociales',
    seoDescripcion:
      'Colegio secundario EPEIM en Río Grande, Tierra del Fuego. Bachiller con orientación en Ciencias Naturales o Ciencias Sociales, modelo Secundaria 2030. Preinscripción online.',
    banda: 'banda-secundario',
    fotos: [fotos.gimnasio],
    perfilTitulo: 'Cuando termina la Secundaria, tu hijo o hija',
    perfil: [
      {
        titulo: 'Es un ciudadano responsable',
        items: [
          'Es solidario, respetuoso de la libertad, reflexivo y crítico.',
          'Toma decisiones informadas y autónomas usando lo que sabe de ciencia y de fenómenos sociales y naturales.',
          'Tiene un marcado sentido de identidad con Tierra del Fuego y se compromete con su entorno político, social, cultural, ambiental y económico.',
        ],
      },
      {
        titulo: 'Está listo para un mundo globalizado',
        items: [
          'Tiene destrezas tecnológicas e idiomáticas.',
          'Sabe comunicarse, trabajar en equipo e interactuar en el ámbito científico.',
          'Se adapta con flexibilidad a nuevos entornos.',
        ],
      },
      {
        titulo: 'Construye su propio camino',
        items: [
          'Se conoce a sí mismo y empieza a construir su proyecto de vida.',
          'Produce y lidera proyectos propios, con imaginación, iniciativa e impulso emprendedor.',
        ],
      },
    ],
  },
];

export const orientaciones = [
  {
    nombre: 'Bachiller con Orientación en Ciencias Naturales',
    corto: 'Ciencias Naturales',
    items: [
      'Sale preparado para continuar estudios superiores vinculados a las Ciencias Naturales.',
      'Tiene un marco ético para trabajar por el bien común y una actitud crítica y propositiva frente a los problemas socialmente relevantes del campo.',
    ],
  },
  {
    nombre: 'Bachiller con Orientación en Ciencias Sociales',
    corto: 'Ciencias Sociales',
    items: [
      'Sale preparado para continuar estudios superiores vinculados a las Ciencias Sociales.',
      'Tiene un marco ético para trabajar por el bien común y una actitud crítica y propositiva frente a los problemas socialmente relevantes del campo.',
      'Analiza y explica fenómenos cambiantes desde diversas perspectivas.',
    ],
  },
];

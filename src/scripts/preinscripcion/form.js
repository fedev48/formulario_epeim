// Lógica del formulario. writePDF y las funciones find* son las de Contenido/Forma inscripción/index.js
// sin cambios: el PDF que llega al Google Sheet tiene que salir igual que antes.
import { Model } from 'survey-core';
import 'survey-core/i18n/spanish';
import 'survey-js-ui';
import { json } from './survey-json.js';
import { themeJson } from './theme.js';
import { iniciarRecorrido } from './recorrido.js';
import { iniciarNivel, iniciarGlobo } from './nivel.js';

const NIVELES_URL = { inicial: '1', primario: '2', secundario: '3' };

// Firebase solo hace falta para enviar: se descarga aparte, así el formulario aparece antes. Se pide
// apenas el formulario está en pantalla (para que App Check ya esté listo al enviar) y, si todavía
// no llegó, se espera al enviar.
let firebase = null;
const cargarFirebase = () => (firebase ??= import('./firebase.js'));

const survey = new Model(json);
survey.locale = 'es';
survey.showCompletedPage = false;
survey.widthMode = 'responsive';
survey.applyTheme(themeJson);

// Solo con el emulador: deja el modelo a mano para las pruebas automáticas.
if (import.meta.env.PUBLIC_FIREBASE_EMULATOR) window.__survey = survey;

const nivel = NIVELES_URL[new URLSearchParams(location.search).get('nivel') ?? ''];
if (nivel) survey.setValue('levell-selection', nivel);

const contenedor = document.getElementById('surveyElement');
const estados = document.querySelectorAll('[data-estado]');
const botonReintentar = document.querySelector('[data-reintentar]');
const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
let datos = null;
let pendiente = null;

function mostrarEstado(nombre) {
  contenedor.hidden = nombre !== null;
  estados.forEach((el) => (el.hidden = el.dataset.estado !== nombre));
  const visible = nombre && document.querySelector(`[data-estado="${nombre}"]`);
  if (visible) {
    visible.scrollIntoView({ block: 'start', behavior: reducirMovimiento.matches ? 'auto' : 'smooth' });
    visible.querySelector('[data-foco]')?.focus({ preventScroll: true });
  }
}

// Arma el PDF y los campos que se guardan. Si falla (por ejemplo, no carga jsPDF),
// "Enviar de nuevo" lo vuelve a intentar; si ya está armado, se reutiliza.
async function preparar() {
  await cargarJsPDF();
  const pdf = writePDF(datos);
  return {
    studentName: findStudentName(),
    studentLevel: findStudentLevel(),
    studentCourse: findStudentCourse(),
    blob: await createBlobFile(pdf),
  };
}

async function enviar() {
  mostrarEstado('enviando');
  try {
    pendiente ??= await preparar();
    const { guardarPreinscripcion } = await cargarFirebase();
    await guardarPreinscripcion(pendiente);
    mostrarEstado('ok');
  } catch (error) {
    console.error('Error writing document: ', error);
    mostrarEstado('error');
  }
}

// El nivel se elige antes que el resto, así que las respuestas se ordenan como las preguntas del
// formulario: el PDF sale en el mismo orden que el del formulario original.
function enOrdenDelFormulario(data) {
  const ordenadas = {};
  for (const q of survey.getAllQuestions()) {
    const clave = q.getValueName();
    if (clave in data) ordenadas[clave] = data[clave];
  }
  return Object.assign(ordenadas, data);
}

survey.onComplete.add((sender) => {
  datos = enOrdenDelFormulario(sender.data);
  pendiente = null;
  enviar();
});

botonReintentar?.addEventListener('click', () => {
  if (datos) enviar();
});

// jsPDF 1.3.5 (misma versión que el formulario original) se carga recién al enviar.
function cargarJsPDF() {
  if (window.jsPDF) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/vendor/jspdf-1.3.5.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar jsPDF'));
    document.head.append(script);
  });
}

function writePDF(jsonData){
    var doc = new window.jsPDF();
    let y = 10;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 7;

    var jsonObject = jsonData;
    for (let key in jsonObject) {
        let title = findTitleByName(key);
        let value = jsonObject[key];
        if (isImg(key)) {
            let imgData = value;
            doc.text(10, y, title);
            y += lineHeight;
            doc.addImage(imgData, 'JPEG', 10, y, 50, 50);
            y += 60;
        } else {
            if (Array.isArray(value)) {
                doc.text(10, y, title);
                y += lineHeight;
                for (let item of value) {
                    if (typeof item === 'object' && item !== null) {
                        for (let subKey in item) {
                            if (item.hasOwnProperty(subKey)) {
                                let subValue = item[subKey];
                                let subTitle = findTitleByNameInArray(subKey, key);
                                let text = subTitle + " : " + String(subValue);
                                let lines = doc.splitTextToSize(text, maxLineWidth);
                                for (let line of lines) {
                                    if (y + lineHeight > pageHeight - margin) {
                                        doc.addPage();
                                        y = margin;
                                    }
                                    doc.text(20, y, line);
                                    y += lineHeight;
                                }
                            }
                        }
                    }
                }
            }else {
                if (jsonObject.hasOwnProperty(key)) {
                    if (findTitleByName(key)) {
                        let title = findTitleByName(key);
                        let text = title + " : " + findChoiceText(key, jsonObject[key]);
                        let lines = doc.splitTextToSize(text, maxLineWidth);
                        for (let line of lines) {
                            if (y + lineHeight > pageHeight - margin) {
                                doc.addPage();
                                y = margin;
                            }
                            doc.text(10, y, line);
                            y += lineHeight;
                        }
                    }
                }
            }
            y += lineHeight;
        }
    }
    return doc;
}

function findTitleByName(name) {
    if (name === "dynamic-panel-parents") {
        return "Datos de la familia:";
    } else {
        for (let element of survey.getAllQuestions()) {
            if (element.name === name) {
                return element.title;
            }
        }
    }
    return "Elemento no encontrado";
}

function findStudentName() {
    let studentName = "";
    for (let element of survey.getAllQuestions()) {
        if (element.name === "student-name" && element.value) {
            studentName = element.value;
        } else if (element.name === "student-last-name" && element.value) {
            studentName += " " + element.value;
        }
    }
    return studentName;
}

function findStudentLevel() {
    let studentLevel = "";
    for (let element of survey.getAllQuestions()) {
        if (element.name === "levell-selection" && element.value) {
            studentLevel = findChoiceText("levell-selection", element.value);
        }
    }

    return studentLevel;
}

function findStudentCourse() {
    let studentGrade = "";
    for (let element of survey.getAllQuestions()) {
        if (element.name === "grado"&& element.value) {
            studentGrade = findChoiceText("grado", element.value);
        } else if (element.name === "gradoSec" && element.value) {
            studentGrade = findChoiceText("gradoSec", element.value);
        }else if (element.name === "sala" && element.value) {
            studentGrade = findChoiceText("sala", element.value);
        }
    }
    return studentGrade;
}

function findTitleByNameInArray(name, array) {
    for (let element of survey.getAllQuestions()) {
        if (element.name === array) {
            for (let item of element.jsonObj.templateElements) {
                if (item.name === name) {
                    return item.title;
                }
            }
        }
    }
    return "Elemento no encontrado";
}

function isImg(name) {
    if (name === "signature") {
        return true;
    } else {
        return false;
    }
}

function findChoiceText(questionName, value) {
    let question = survey.getQuestionByName(questionName);
    if (question && question.choices) {
        for (let choice of question.choices) {
            if (choice.value == value) {
                return choice.text;
            }
        }
    }
    return value;
}

async function createBlobFile(doc) {
    var blobFile = doc.output('blob');

    const blobToBase64 = async blob => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = err => reject(err);
            reader.readAsDataURL(blob);
        });

    };

    const base64Blob = await blobToBase64(blobFile);
    // Extraer solo la parte de la cadena Base64
    const base64String = base64Blob.split(',')[1];

    return base64String;
}

survey.render(contenedor);
document.querySelector('[data-cargando-formulario]')?.remove();
(window.requestIdleCallback || setTimeout)(() => cargarFirebase().catch(() => (firebase = null)));
iniciarNivel(survey);
iniciarGlobo();
iniciarRecorrido(survey);

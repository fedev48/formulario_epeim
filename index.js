const survey = new Survey.Model(json); 
survey.completedHtml = "<h3>¡Gracias por tu interés en nuestra institución!</h3><p>Su solicitud ha sido incluida en nuestra lista de espera. Nos pondremos en contacto con usted apenas tengamos novedades.</p>";
survey.hideRequiredErrors = true;
survey.applyTheme(themeJson); 
survey.onComplete.add(async(sender, options) => {

    
    // writePDF(sender.data).save(findStudentName() + ".pdf");
    const pdf = writePDF(sender.data);
    const blob = await createBlobFile(pdf);
    
    verificarYGuardarEstudiante(blob);
   
});

function writePDF(jsonData){
    var doc = new jsPDF();
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
                        // let text = title + " : " + String(jsonObject[key]);
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
            // onsole.log(element.value);
            studentGrade = findChoiceText("grado", element.value);
        } else if (element.name === "gradoSec" && element.value) {
            // console.log(element.value);
            studentGrade = findChoiceText("gradoSec", element.value);
        }else if (element.name === "sala" && element.value) {
            // onsole.log(element.value);
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



survey.render(document.getElementById("surveyElement"));
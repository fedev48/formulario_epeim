const json = {
 "logoPosition": "right",
 "pages": [
  {
   "name": "student-information",
   "elements": [
    {
     "type": "panel",
     "name": "student-info-panel",
     "elements": [
      {
       "type": "text",
        "name": "student-name",
        "title": "Nombre",
        "titleLocation": "top",
        "descriptionLocation": "underInput",
        // "isRequired": true,
      },
   
      {
       "type": "text",
       "name": "student-last-name",
       "startWithNewLine": false,
       "titleLocation": "top",
       "title": "Apellido",
      //  "isRequired": true,
      },
      {
        "type": "text",
        "name": "dni",
        "startWithNewLine": true,
        "titleLocation": "top",
        "title": "DNI",
        // "isRequired": true,
        "pattern": "\\d{2}\\.\\d{3}\\.\\d{3}",
        "maskType": "pattern",
        "maskSettings": {
        "pattern": "99.999.999"
       },
       },
      {
       "type": "text",
       "name": "dob",
       "startWithNewLine": false,
       "title": "Fecha de nacimiento",
       "titleLocation": "top",
       "inputType": "date",
       "autocomplete": "bday",
       "min": "2006-01-01",
       "max": "2024-01-01",
       "maskType": "datetime",
      //  "isRequired": true
      },
      {
        "type":"dropdown",
        "name":"levell-selection",
        "startWithNewLine":true,
        "titleLocation": "top",
        "maxWidth": "30%",
        "title":"Seleccione el nivel educativo",
        // "isRequired": true,
        "choices": [
            {
                "value":"1",
                "text":"Jardin de infantes"
            },
            {
                "value":"2",
                "text":"Primario"
            },
            {
                "value":"3",
                "text":"Secundario"
            }
        ]
      },
      {
        "type": "dropdown",
        "name": "sala",
        "title": "Sala",
        "startWithNewLine":false,
        "titleLocation": "top",
        "visibleIf": "{levell-selection} = '1'",
        // "isRequired": true,
        "choices": [
          {
            "value": "1",
            "text": "Sala de 3 años"
          },
          {
            "value": "2",
            "text": "Sala de 4 años"
          },
          {
            "value": "3",
            "text": "Sala de 5 años"
          }
        ]
      },
      {
        "type": "dropdown",
        "name": "grado",
        "title": "Grado",
        "startWithNewLine":false,
        "titleLocation": "top",
        "visibleIf": "{levell-selection} = '2'",
        // "isRequired": true,
        "choices": [
          {
            "value": "1",
            "text": "Primer grado"
          },
          {
            "value": "2",
            "text": "Segundo grado"
          },
          {
            "value": "3",
            "text": "Tercer grado"
          },
          {
            "value": "4",
            "text": "Cuarto grado"
          },
          {
            "value": "5",
            "text": "Quinto grado"
          },
          {
            "value": "6",
            "text": "Sexto grado"
          },
        ]
      },
      {
        "type": "dropdown",
        "name": "gradoSec",
        "title": "Año",
        "startWithNewLine":false,
        "titleLocation": "top",
        "visibleIf": "{levell-selection} = '3'",
        // "isRequired": true,
        "choices": [
          {
            "value": "1",
            "text": "Primero ESO"
          },
          {
            "value": "2",
            "text": "Segundo ESO"
          },
          {
            "value": "3",
            "text": "Tercero ESO"
          },
          {
            "value": "4",
            "text": "Cuarto ESO"
          },
          {
            "value": "5",
            "text": "Quinto ESO"
          },
          {
            "value": "6",
            "text": "Sexto ESO"
          },
        ]
      },
      {
        "type": "dropdown",
        "name": "mode",
        "title": "Modalidad",
        "startWithNewLine":false,
        "titleLocation": "top",
        "visibleIf": "{levell-selection} = '3'&&({gradoSec} = '4'||{gradoSec} = '5'||{gradoSec} = '6')",
        "choices": [
          {
            "value": "1",
            "text": "Naturales"
          },
          {
            "value": "2",
            "text": "Sociales"
          },
        ]
      },
      {
        "type": "text",
        "name": "prev-school",
        "startWithNewLine": true,
        "titleLocation": "top",
        "title": "Institución de la que procede",
        "isRequired": false,
       },
       {
        "type": "comment",
        "name": "why-change",
        "title": "Cuéntenos las razones que lo acercaron a nuestra institución",
        "titleLocation": "top",
        "isRequired": false,
      },
     ],
     "questionTitleWidth": "120px"
    }
   ],
   "title": "Información del estudiante"
  },
  {
   "name": "parents-information",
   "elements": [
    {
     "type": "paneldynamic",
     "name": "dynamic-panel-parents",
     "titleLocation": "hidden",
     "templateElements": [
      {
       "type": "text",
       "name": "parent-name",
       "title": "Nombre",
       "titleLocation": "top",
      //  "isRequired": true,
      },
      {
       "type": "text",
       "name": "parent-last-name",
       "startWithNewLine": false,
       "titleLocation": "top",
       "title": "Apellido",
      //  "isRequired": true,
      },
      {
       "type": "text",
       "name": "phone-number",
       "title": "Numero de teléfono",
       "titleLocation": "top",
       "maskType": "pattern",
       "maskSettings": {
        "pattern": "9999-999999"
       },
      //  "isRequired": true,
      },
      {
       "type": "text",
       "name": "email-address",
       "startWithNewLine": false,
       "title": " Email",
       "titleLocation": "top",
       "autocomplete": "email",
        "inputType": "email",
      }
     ],
     "panelCount": 1,
     "minPanelCount": 1,
     "maxPanelCount": 2,
     "panelAddText": "Agregar tutor"
    },
    {
      "type": "comment",
      "name": "campo-texto-extensible",
      "title": "Observaciones",
      "titleLocation": "top",
      "isRequired": false,
    //   "rows": 5,
    //   "cols": 50
    },
    {
     "type": "radiogroup",
     "name": "acknowledgement",
     "titleLocation": "hidden",
     "choices": [
      {
       "value": "Item 1",
       "text": "La información proporcionada es correcta y completa"
      }
     ]
    },
    
    {
     "type": "signaturepad",
     "name": "signature",
     "title": "Firma",
     "maxWidth": "30%",
     "placeholder": "Firma",
     "titleLocation": "hidden",
     "signatureWidth": 335
    },
    {
     "type": "text",
     "name": "printed-name",
     "maxWidth": "30%",
     "titleLocation": "hidden",
     "placeholder": "Nombre y apellido",
    }
   ],
   "title": "Información del tutor"
  },
  
 ],
"showQuestionNumbers": "off",
 "questionTitleLocation": "left",
 "completeText": "Enviar",
 "questionsOnPageMode": "singlePage",
 "widthMode": "static",
 "width": "1300",
 "headerView": "advanced",
};
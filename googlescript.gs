function getAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var firebaseUrl = "https://formulario-de-pre-inscrip-db-default-rtdb.firebaseio.com";
  var dataPath = "/students"; // Define la ruta de datos

  var jsonKey = JSON.parse(PropertiesService.getScriptProperties().getProperty("service_account"));
  
  var key = jsonKey.private_key;
  var clientEmail = jsonKey.client_email;  

  var serverToken = new init(key, ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'], clientEmail);
  
  serverToken.addUser(clientEmail).requestToken();
  var token = serverToken.getToken(clientEmail).token;

  Logger.log(token);

  // Configurar las opciones para la solicitud
  var options = {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token // Enviando el token aquí
    },
    muteHttpExceptions: true
  };

  // Realizar la solicitud a Firebase
  var result = UrlFetchApp.fetch(firebaseUrl + dataPath + '.json', options).getContentText();
  
  // Convertir la respuesta JSON en un objeto
  var dataSet = JSON.parse(result);

  // Procesar los datos
  const estudiantes = Object.values(dataSet)
    .map(estudiante => ({...estudiante, Fecha: new Date(estudiante.Fecha)}))
    .map(estudiante =>({...estudiante, blob: checkIfPDFExists(estudiante.blob, estudiante.Estudiante_inscripto, estudiante.Nivel)}))
    .map(estudiante => Object.values(estudiante));

  const numEstudiantes = estudiantes.length;
  const cantidadDeColumnas = estudiantes[0].length;
  const filaInicial = 2;
  const columnaInicial = 1;
  let dataRange = sheet.getRange(filaInicial, columnaInicial, numEstudiantes, cantidadDeColumnas);

  dataRange.setValues(estudiantes);
}

function checkIfPDFExists(base64String, nombre, grado) {
    const files = DriveApp.getFilesByName(nombre + ".pdf");

    if (files.hasNext()) {
        const file = files.next();
        return file.getUrl();
    } else {
        return base64ToPdf(base64String, nombre, grado);
    }
}

// function compareLists(students) {
//     const files = DriveApp.getFilesByType('application/pdf');
//     const fileNames = [];
//     let itmesToErase = [];

//     // Recopilar todos los nombres de archivos PDF en un array
//     while (files.hasNext()) {
//       const file = files.next();
//       for (let i = 0; i < students.length; i++) {
//       const studentFileName = students[i][0] + ".pdf";
//       if (file.getName === studentFileName) {
//           console.log("existe: " + studentFileName);
//       } else {
//           console.log("no existe: " + studentFileName);
//       }
//     }

//   }

    
// }

function base64ToPdf(base64String, nombre, grado) {
    base64String = base64String.replace(/[^A-Za-z0-9+/=]/g, '');

    try {
        const byteArray = Utilities.base64Decode(base64String);
        const pdfBlob = Utilities.newBlob(byteArray, 'application/pdf', `${nombre}.pdf`);
        const folder = getOrCreateFolder(grado);
        const file = folder.createFile(pdfBlob);
        const url = file.getUrl();
        Logger.log('Archivo PDF creado: ' + url);
        return url;
    } catch (e) {
        Logger.log('Error al decodificar la cadena Base64: ' + e.message);
    }
}

function getOrCreateFolder(folderName) {
    // Buscar la carpeta por nombre
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
        return folders.next();
    }
    return DriveApp.createFolder(folderName);
}









/*
* GAS library for generating user OAuth Tokens via Google service account.
* @param {String} rsaKey The private_key from your service account JSON key
* @param {Array} Scopes An Array of scopes you want to authenticate
* @param {String} saEmail The service account Email
* @return {object} self for chaining
*/
function init(rsaKey, Scopes, saEmail){
  return new saService_(rsaKey,Scopes,saEmail);
}


function saService_(rsaKey, Scopes, saEmail){

  var self = this;
  var rsaKey_ = rsaKey;
  var Scopes_ = Scopes;
  var saEmail_ = saEmail;
  var jwts_ ;
  var tokens_ = {};
  var expireTime_;
  var subAccounts_;
  
  
  if (!rsaKey_) {
    throw 'You must provide the private key';
  }
  if(!(Scopes_.constructor === Array)){
    throw "The Scopes must be in a valid array"
  }
  
  if (!Scopes_) {
    throw 'You must provide atleast one scope';
  }
  
  if (!saEmail_) {
    throw 'You must provide the service account email';
  }
  
  self.addUser = function(userEmail){
    if(!subAccounts_)subAccounts_ = [];
    subAccounts_.push(userEmail);
    return self;
  }
  
  self.addUsers = function(userEmailArray){
    if(!subAccounts_)subAccounts_ = [];
    subAccounts_ =  Array.concat(subAccounts_,userEmailArray);
    return self;
  }
  
  self.removeUsers = function(){
    subAccounts_ = null;
    return self;
  }
  
  self.removeUser = function(userEmail){
    var index = subAccounts_.indexOf(userEmail);
    if (index > -1) {
      subAccounts_.splice(index, 1);
    }
    return self;
  }
  
  self.generateJWT_ = function(){
    var sResult="",
        claim="",
        JWTs = {},
        header = Utilities.base64Encode('{"alg":"RS256","typ":"JWT"}');
    
    if(!subAccounts_){
      throw new Error("You must add at least one user account");
    }
    
    for(var i=0; i < subAccounts_.length; i++){
      claim = header+"."+Utilities.base64Encode(JSON.stringify(makeClaim(subAccounts_[i])));
      JWTs[subAccounts_[i]]={"signedClaim": claim +"."+ Utilities.base64Encode(Utilities.computeRsaSha256Signature(claim, rsaKey_)),
                             "expire":expireTime_};
    }
    jwts_ = JWTs;
    return self;
  } 
  
  self.getToken = function(userEmail){
    if(!(userEmail in tokens_)){
      throw new Error("User not found");    
    }else{
      return tokens_[userEmail];
    }
  }
  
  self.getTokens = function(){
    return tokens_;
  }
  
  
  
  
  self.requestToken = function(){
    self.generateJWT_();
    if(!jwts_){
      throw 'You must run generateJWT'
    }
    
    var params = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: ''
    }
    
    
    var url = "https://www.googleapis.com/oauth2/v3/token"
    var parameters = { 'method' : 'post',                    
                      'payload' : params,
                      muteHttpExceptions:true};
    
    var response="";
    
    for(var user in jwts_){
      params.assertion = jwts_[user].signedClaim;
      response = JSON.parse(UrlFetchApp.fetch(url,parameters).getContentText());
      
      if(response.error){
        if(response.error === "invalid_grant"){
          tokens_[user]={};
          tokens_[user].token = "invalid_grant: Does this user exist?";
          tokens_[user].expire = jwts_[user].expire;
        }else{
          throw new Error('There was an error requesting a Token from the OAuth server: '+ response.error);
        }
      }
      
      if(response.access_token){
        tokens_[user]={};
        tokens_[user].token = response.access_token;
        tokens_[user].expire = jwts_[user].expire;
      }
    }
    return self;
  }
  
  
  self.tokenService = function(email){
      return function(){
        var token = self.getToken(email);
        if(token.expire<(Date.now()/1000).toString().substr(0,10)){
          self.requestToken()
        }
        return self.getToken(email).token;
      }
    }
  
  function makeClaim(subAccount){
    var now = (Date.now()/1000).toString().substr(0,10);
    var exp = (parseInt(now) + 3600).toString().substr(0,10);
    expireTime_ = exp;
    var claim = 
        {
          "iss": saEmail_,
          "sub": subAccount,
          "scope": Scopes_.join(" "),
          "aud":"https://www.googleapis.com/oauth2/v3/token",
          "iat": now,
          "exp": exp
        };
    if(subAccount === saEmail_){
      delete claim.sub;
    }
    return claim;
  }
  return self;
}
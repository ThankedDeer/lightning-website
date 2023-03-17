const crypto = require("crypto");
const frase = "MiPassword";

var cifrado = crypto.createHash('sha1').update(frase).digest('hex');
console.log(frase + " en sha1 " + cifrado);

var cifrado = crypto.createHash('md5').update(frase).digest('hex');
console.log(frase + " en md5 " + cifrado);
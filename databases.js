const database = require('mysql2');
const connectionDataBase = database.createConnection({
    host: 'localhost', 
    user: 'root',
    password: 'Eclatbmx1',
    database: 'emdst2'
});

connectionDataBase.connect(function(err){
    if (err){
        console.error(err)
        return;
    }
    else{
        console.log("Conectado a la base de datos...");
    }
});
exports.connectionDataBase = connectionDataBase
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const app = express();
const DB = require("./databases");
const { json } = require("express");

app.use(express.json());
app.use(cors());
app.use(express.static("views"));
var databases = DB.connectionDataBase;

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/api", (req, resp) => {
  var respuesta = {};
  respuesta.mensaje = "petición GET recbido ...";
  resp.json(respuesta);
});

app.get("/menu", (req, res) => {
  res.render("menu");
});

app.get("/CPA", (req, res) => {
  res.render("CPA");
});
app.get("/CVE", (req, res) => {
  res.render("CVE");
});
app.get("/CTPA", (req, res) => {
  res.render("CTPA");
});
app.get("/CMC", (req, res) => {
  res.render("CMC");
});

//motor de plantillas
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));

app.post("/Login", (req, resp) => {
  const reqData = {};
  var Matricula = req.body.Matricula;
  var Contraseña = req.body.Contraseña;
  // console.log(Matricula, Contraseña);

  databases.query(
    "select * from alumno where Matricula = ? and Contraseña = sha1(?)",
    [Matricula, Contraseña],
    (err, rows, fields) => {
      console.log(rows);
      if (!err) {
        const hash = crypto.createHash("sha1").update(Contraseña).digest("hex");
        if (
          rows.length == 1 &&
          rows[0].Matricula == Matricula &&
          rows[0].Contraseña == hash
        ) {
          const user = rows[0];
          jwt.sign(
            { user: user },
            "accessKey",
            { expiresIn: "1h" },
            (err, token) => {
              resp.json({ token: token });
            }
          );
        } else {
          resp.sendStatus(403);
        }
      } else {
        resp.sendStatus(503);
      }
    }
  );
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  //console.log(req.headers);
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    console.log(bearerToken);
    next();
  } else {
    res.sendStatus(403);
  }
}

const port = 3000;
app.listen(port, () => {
  console.log("servidores en el puerto", +port);
});

//consultas

//consulta de informacion alumno
//app.get("/consultaNombre", verifyToken, (request, response) => {
app.get("/consultaNombre/:Matricula", verifyToken, (request, response) => {
  //const matricula = request.body.Matricula;
  const matricula = request.params.Matricula;
  console.log(matricula);
  var respuesta = {};

  jwt.verify(request.token, "accessKey", (err, authData) => {
    if (err) {
      response.sendStatus(403);
    } else {
      databases.query(
        "select a.Nombre , a.Ape_Pa , a.Ape_Ma , g.Cuatrimestre,c.Carrera,a.Matricula from Alumno as a inner join grupo as g on  g.idGrupo = a.idGrupo inner join Carrera as c  on  c.idCarrera = a.idCarrera where matricula = ?;",
        [matricula],
        function (err, rows, fields) {
          if (!err) {
            respuesta.estado = true;
            respuesta.comentario = "consulta  correcta";
            respuesta.filas = rows.affectedRows;
            response.json(rows);
          } else {
            respuesta.estado = false;
            respuesta.comentario = "Error en consulta ";
            respuesta.error = err;
            response.json(respuesta);
          }
        }
      );
    }
  });
});

//consulta calificiaciones del alumno 
app.get("/consultaCalificaciones/:Matricula", verifyToken, (request, response) => {
  const matricula = request.params.Matricula;
  var respuesta = {};
  jwt.verify(request.token, "accessKey", (err, authData) => {
    if (err) {
      response.sendStatus(403);
    } else {
      console.log("vamos a la consulta...");
      databases.query(
        "select format(avg(calificacion),1) as Calificacion from Calificaciones where matricula = ?;",
        [matricula],
        function (err, rows, fields) {
          if (!err) {
            console.log(matricula);
            respuesta.estado = true;
            respuesta.comentario = "consulta  correcta";
            respuesta.filas = rows.affectedRows;
            response.json(rows);
          } else {
            respuesta.estado = false;
            respuesta.comentario = "Error en consulta ";
            respuesta.error = err;
            response.json(respuesta);
          }
        }
      );
    }
  });
});


//consulta materias y calificaciones alumno 

app.get("/consultaMaterias/:Matricula", verifyToken, (request, response) => {
  const matricula = request.params.Matricula;
  var respuesta = {};

  jwt.verify(request.token, "accessKey", (err, authData) => {
    if (err) {
      response.sendStatus(403);
    } else {
      console.log("vamos a la consulta...");
      databases.query(
        "select m.idMateria, m.Nom_Materia from grupo_materia as gm inner join Materia as m on m.idMateria = gm.idMateria inner join alumno as a on a.idGrupo=gm.idGrupo where a.matricula= ?;",
        [matricula],
        function (err, rows, fields) {
          if (!err) {
            console.log(matricula);
            respuesta.estado = true;
            respuesta.comentario = "consulta  correcta";
            respuesta.filas = rows.affectedRows;
            response.json(rows);
          } else {
            respuesta.estado = false;
            respuesta.comentario = "Error en consulta ";
            respuesta.error = err;
            response.json(respuesta);
          }
        }
      );
    }
  });
});

app.get("/consultaMateriasycalificacion/:Matricula", verifyToken, (request, response) => {
  const matricula = request.params.Matricula;
  var respuesta = {};

  jwt.verify(request.token, "accessKey", (err, authData) => {
    if (err) {
      response.sendStatus(403);
    } else {
      console.log("vamos a la consulta...");
      databases.query("select m.Nom_Materia,format( avg (calificacion),1) as calificacion from calificaciones as c inner join materia as m on m.idMateria = c.idMateria where c.Matricula = ? group by c.idMateria;;",[matricula],
        function (err, rows, fields) {
          if (!err) {
            console.log(matricula);
            respuesta.estado = true;
            respuesta.comentario = "consulta  correcta";
            respuesta.filas = rows.affectedRows;
            response.json(rows);
          } else {
            respuesta.estado = false;
            respuesta.comentario = "Error en consulta ";
            respuesta.error = err;
            response.json(respuesta);
          }
        }
      );
    }
  });
});

app.get('/productos', (req, res) => {
  databases.query('SELECT * FROM emdst2.producto;', (error, rows, fields) => {
    if (error){
      console.log(error);
    }else{
      res.json(rows);
    }
  })
})

app.get('/productos/:idProducto', (req,res)=>{
  var idProducto=req.params.idProducto;
  databases.query('SELECT * FROM producto where idProducto=?;',[idProducto],(error,rows,fields)=>{
      if(error){
          alert("Error");
      }
      else{
          res.json(rows);
          
      }
  });
});

app.delete("/eliminar/:idProducto", (request, response) => {
  var idProducto= request.params.idProducto;
  var respuesta = {};
  databases.query(
    "delete from producto where idProducto= ?;",[idProducto],
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});

app.put('/productos/update', (request,response)=>{
  var idProducto=request.body.idProducto;
  var Nombre=request.body.Nombre;
  var Precio=request.body.Precio;
  console.log(request.body);
  
databases.query('UPDATE producto SET Nombre=?, Precio=? where idProducto = ?;',[Nombre, Precio, idProducto],(error,rows,fields)=>{
      if(error){
          console.log(error);
      }
      else{
          
          response.json(rows);
          console.log(rows);
      }
  });
});
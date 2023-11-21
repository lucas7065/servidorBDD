const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const cors = require('cors');

// Habilitar CORS para todas las rutas
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(bodyParser.json());

const mysql = require("mysql");
let conexion = mysql.createConnection({
    host: 'localhost',
    database: 'tpfinal',
    user: 'root',
    password: 'admin'
});

app.set('view engine', 'ejs');

app.listen(3000, function(){
    console.log('Servidor creado http://localhost:3000');
});

app.get('/', function(req, res){
    res.render("register")
});

app.get('/login', function(req,res){
    res.render("login")
})

app.post("/validar", function(req, res){
    const datos = req.body;

    let nombre = datos.nombre;
    let apellido = datos.apellido;
    let email = datos.email;
    let contraseña = datos.password;

    let buscar = "SELECT * FROM usuarios WHERE email = '" + email + "'";
    conexion.query(buscar, function(err, row){
        if(err){
            console.error(err);
            return res.status(500).send('Error en el servidor');
        } else {
            if(row.length > 0){
                console.log("Email ya registrado");
                return res.status(409).json({ error: 'Email ya registrado' });
            } else {
                let registrar = "INSERT INTO usuarios (nombre, apellido, email, password) VALUES ('" + nombre + "', '" + apellido + "', '" + email + "', '" + contraseña + "')";

                conexion.query(registrar, function(err){
                    if(err) {
                        console.error(err);
                        return res.status(500).send('Error en el servidor');
                    }

                    console.log("Datos almacenados correctamente");
                    return res.status(200).json({ message: 'Datos almacenados correctamente' });
                });
            }
        }
    });
});

/*
app.post("/login", function(req, res){
    const datos = req.body;

    let email = datos.email;
    let contraseña = datos.password;

    let buscar = "SELECT * FROM usuarios WHERE email = '" + email + "' AND password = '" + contraseña + "' ";

    conexion.query(buscar, function(err, rows){
        if(err){
            console.log(err)
            return res.status(500).send("Error en el servidor");
        }else{
            if(rows.length>0){
                console.log("Inicio de sesion exitoso");
                return res.status(200).json({message: 'Inicio de sesion exitoso'});
            }else{
                console.log("Credenciales incorrectas");
                return res.status(401).json({error: 'Credenciales incorrectas'});
            }
        }
    })
})
*/
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
  
    const query = `SELECT * FROM usuarios WHERE email = ? AND password = ?`;
  
    conexion.query(query, [email, password], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
        return;
      }
  
      const user = results[0];
  
      if (user) {
        const token = jwt.sign({ idUsuario: user.idUsuario }, '123', { expiresIn: '1h' });
  
        res.json({ token, userDetails: { idUsuario: user.idUsuario, nombre: user.nombre, apellido: user.apellido } });
      } else {
        res.status(401).json({ message: 'Credenciales inválidas' });
      }
    });
  });
  

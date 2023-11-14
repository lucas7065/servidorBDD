const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

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

app.post("/validar", function(req, res){
    const datos = req.body;

    let nombre = datos.nombre;
    let apellido = datos.apellido;
    let email = datos.email;
    let contraseña = datos.contraseña;

    let buscar = "SELECT * FROM usuarios WHERE correo = '"+email+"'";

    conexion.query(buscar, function(err, row){
        if(err){
            throw err;
        } else{

            if(row.length>0){
                console.log("Email ya registrado");
            }else{
                let registrar = "INSERT INTO usuarios (nombre, apellido, correo, contraseña) VALUES ('"+nombre+"', '"+apellido+"', '"+email+"', '"+contraseña+"')";

                conexion.query(registrar, function(err){
                    if(err) throw err
                    console.log("Datos almacenados correctamente");
                });
            }
        }  
    })
});


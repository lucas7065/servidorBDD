const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const cors = require('cors');

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


app.post('/api/login', (req, res) => {
    const datos = req.body;
    let email = datos.email;
    let password = datos.password;

    const query = `SELECT * FROM usuarios WHERE email = ? AND password = ?`;

    conexion.query(query, [email, password], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
  
      const user = results[0];

    if (user && user.password == password) {
        console.log("Logeo exitoso");
        return res.status(200).json(user);
    } else {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }   
    });
  });

  /*

  app.get('/api/userinfo', async (req, res) => {
    try {
      // Recuperar la información del usuario desde la base de datos
      const userInfo = await obtenerInformacionUsuarioDesdeBaseDeDatos(req.params.idUsuario);
  
      // Enviar la información del usuario al cliente
      res.json(userInfo);
    } catch (error) {
      console.error('Error al obtener información del usuario desde la base de datos', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Función para obtener información del usuario desde la base de datos
  async function obtenerInformacionUsuarioDesdeBaseDeDatos(idUsuario) {
    try {
      let query = 'SELECT * FROM usuarios WHERE idUsuario = idUsuario';

      const result = await conexion.query(query, {idUsuario});
      const rows = result[0];
      const fields = result[1];

      
      // Si se encontraron resultados, devolver el primer resultado
      if (rows.length > 0) {
        return rows[0];
      } else {
        // Si no se encuentra ningún usuario, puedes devolver null o algún otro valor predeterminado
        return null;
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta SQL', error);
      throw error;
    }
  }

*/
  app.post('/api/insertar-juego-favorito', (req, res) => {
    const datos = req.body;
    const idUsuario = datos.idUsuario;
    const idJuego = datos.idJuego;
  
    let query = "INSERT INTO favoritosXusuario (idUsuario, idJuego) VALUES ('" + idUsuario + "', '" + idJuego + "')";
    conexion.query(query, function(error){
      if(error){
        console.log(err);
        return res.status(500).send('Error en el servidor');
      }

      console.log('Juego agregado a favoritos correctamente.')
      return res.status(200).json({ message: 'Datos almacenados correctamente' });
    });
  });





  app.post('/api/eliminar-juego-favorito', (req, res) => {
    const datos = req.body;
    const idUsuario = datos.idUsuario;
    const idJuego = datos.idJuego;
  
    
    let query = `DELETE FROM favoritosXusuario WHERE idUsuario = ${idUsuario} AND idJuego = ${idJuego};`;
    conexion.query(query, function(error){
      if(error){
        console.log(error);
        return res.status(500).send('Error en el servidor');
      }

      console.log('Juego eliminado de favoritos correctamente.')
      return res.status(200).json({ message: 'Juego eliminado de favoritos correctamente'});
    });
  });
/*
// Nueva ruta para obtener los juegos favoritos del usuario
app.get('/api/juegos-favoritos', (req, res) => {
  const idUsuario = req.query.idUsuario; // Obtén el idUsuario de los parámetros de la consulta

  if (!idUsuario) {
    return res.status(400).json({ error: 'Falta el parámetro idUsuario en la consulta.' });
  }

  // Consulta para obtener los IDs de juegos favoritos del usuario
  const query = 'SELECT idJuego FROM favoritosXusuario WHERE idUsuario = ?';
  conexion.query(query, [idUsuario], (error, results) => {
    if (error) {
      console.error('Error al obtener juegos favoritos:', error);
      res.status(500).send('Error interno del servidor');
    } else {
      const juegosFavoritos = results.map(result => result.idJuego);
      res.status(200).json({ juegosFavoritos });
    }
  });
});
*/





app.get('/api/juegos-favoritos', async (req, res) => {
  const idUsuario = req.query.idUsuario; // Obtén el idUsuario de los parámetros de la consulta

  try {

    const query = 'SELECT idJuego FROM favoritosXusuario WHERE idUsuario = ?';

    conexion.query(query, idUsuario, (err, results)=>{
      if(results){
        return res.status(200).json(results);
      }
    });
  }catch (error) {
    console.error('Error al obtener juegos favoritos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
);


app.get('/api/info-usuario', async(req, res)=>{
  const idUsuario = req.query.idUsuario;
  try{
    const query = 'SELECT * FROM usuarios WHERE idUsuario = ?';
    conexion.query(query, idUsuario, (err, results)=>{
      if(results){
        console.log(idUsuario);
        console.log(query);
        return res.status(200).json(results);
      }
    });
  }catch (error) {
    console.error('Error al obtener informacion del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});





/*
    const [rows] = await conexion.query('SELECT idJuego FROM favoritosXusuario WHERE idUsuario = ?', [idUsuario]);

    // Verificar si hay alguna fila en rows
    if (rows && rows.length > 0) {
      // Extraer los IDs de los juegos favoritos y enviarlos como respuesta
      const juegosFavoritos = rows.map(row => row.idJuego);
      res.json({ juegosFavoritos });
    } else {
      // No se encontraron juegos favoritos para el usuario
      res.json({ juegosFavoritos: [] });
    }
  } catch (error) {
    console.error('Error al obtener juegos favoritos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
  */

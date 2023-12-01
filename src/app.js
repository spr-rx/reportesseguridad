const express = require('express')
const usuarios = require('./routes/usuarios');
const { getAllUsuarios, getUsuariosById,getAllReportesCarpeta, createUser, updateUser, deleteUser, getAllCarpetas, getAllReportes, todosCarpetas, todosReportes, getAllCarpetasSede } = require('./querys');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const config = require('./config');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = config;

const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
 
const querys = require('./querys');
const mysql = require('mysql2');
const router = require('./routes/usuarios');

const { Readable } = require('stream');

const { google } = require("googleapis");

const app = express();
app.use(fileUpload());
app.use(cors()); 
app.use(express.json())

const path = require('path');
app.use(express.urlencoded({ extended: true }));
const Express = require('express');
const { url } = require('inspector');

require('dotenv').config();
// La ruta para servir archivos estáticos debe incluir 'public'
//app.use('/public', express.static(path.resolve(__dirname, 'public')));

app.use(express.static('public'));

//app.use(express.static(path.join(__dirname, "/public")));;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../front/build')))
//app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');


const pool = require('./connection');


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));



/*const redisClient = redis.createClient({
    host: 'roundhouse.proxy.rlwy.net', // Reemplaza con la dirección de tu servidor Redis
    port: 47689,        // Reemplaza con el puerto de tu servidor Redis
  });
  



app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
    })
  );*/


const  PORT = process.env.PORT || 3000

app.set('view engine', 'ejs');


function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        // Usuario autenticado, permite el acceso a la siguiente ruta
        next();
    } else {
        // Usuario no autenticado, redirige a la página de inicio de sesión
        res.redirect('/');
    } 
}


function esUsuarioAutorizado(req, res, next) {
    const usuarioIdEnURL = parseInt(req.query.id); // Obtener el ID de la URL y convertirlo a número entero
    const usuarioIdAutenticado = req.session.primary; // Obtener el ID del usuario autenticado desde la sesión o el token

    

    if (usuarioIdEnURL === usuarioIdAutenticado) {
        // El usuario autenticado tiene permiso para acceder a esta ruta
        next();
    } else {
        // Acceso prohibido si el ID en la URL no coincide con el ID del usuario autenticado
        res.render("error404")
        //res.status(403).json({ mensaje: 'Acceso prohibido' });
    }
}


app.get('/uploads/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'uploads', fileName);

    // Obtener la extensión del archivo
    const fileExtension = path.extname(filePath).toLowerCase();

    // Configurar el tipo de contenido basado en la extensión del archivo
    let contentType = 'application/octet-stream'; // Tipo de contenido predeterminado
    if (fileExtension === '.pdf') {
        contentType = 'application/pdf';
    } else if (fileExtension === '.png') {
        contentType = 'image/png';
    } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
        contentType = 'image/jpeg';
    }

    // Configurar las cabeceras de respuesta
    res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
    res.setHeader('Content-Type', contentType);

    // Enviar el archivo como un flujo binario
    res.sendFile(filePath);
});



app.get('/usuarios/agregar_usuario', requireAuth, async (req, res) => {
    res.render('agregar')
})

app.get('/usuarios/mensajes2', requireAuth, async (req, res) => {
  res.render('mensajes')
})




const jwt = require('jsonwebtoken');
const { apikeys } = require('googleapis/build/src/apis/apikeys');

// Verificar el token de autenticación
function verificarToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ mensaje: 'Acceso denegado' });

    try {
        const usuarioVerificado = jwt.verify(token, 'secreto'); // Cambia 'secreto' por tu clave secreta
        req.usuario = usuarioVerificado;
        next();
    } catch (error) {
        res.status(400).json({ mensaje: 'Token no válido' });
    }
}

// Middleware de autorización para roles específicos
function esAdmin(req, res, next) {
    if (req.session && req.session.admin === 2) {
        next();
    } else {
        res.render("error404")
        //res.status(403).json({ mensaje: 'Acceso prohibido' });
    }
}

app.get('/usuarios',  requireAuth, esAdmin, async (req, res) =>{
    const ruc = req.session.user;
 
    const usuarios = await getAllUsuarios();
    const carpetas = await todosCarpetas();
    const reportes = await todosReportes();

    rango = carpetas.length
    rango2 = reportes.length
    rango3 = usuarios.length

    res.render('index', { usuarios, ruc, rango, rango2, rango3 });
} )


app.get('/ver_reporte', (req, res) => {
    const { ruta } = req.query; // Obtén la ruta del parámetro de consulta
    console.log('Ruta recibida en el servidor:', ruta);
    // Realiza las acciones que necesites con la ruta en el servidor
    res.render('ver_reporte', { ruta });
});



async function esUsuarioAutorizadoCarpeta(req, res, next) {
  const usuarioIdEnURL = parseInt(req.query.id_carpeta); // Obtener el ID de la URL y convertirlo a número entero
  const usuarioIdAutenticado = req.session.primary; // Obtener el ID del usuario autenticado desde la sesión o el token
  

  console.log(usuarioIdEnURL)
  console.log(usuarioIdAutenticado)

  const [results] = await pool.execute('SELECT usuarios.* FROM usuarios JOIN carpeta_nombre ON usuarios.id = carpeta_nombre.id_usuario JOIN carpetas ON carpeta_nombre.id = carpetas.id_carpeta_nombre WHERE usuarios.id = ? AND carpeta_nombre.id = ?; ', [usuarioIdAutenticado, usuarioIdEnURL]);

  if (results.length > 0) {
      // El usuario autenticado tiene permiso para acceder a esta ruta
      next();
  } else {
      // Acceso prohibido si el ID en la URL no coincide con el ID del usuario autenticado
      res.render("error404")
      //res.status(403).json({ mensaje: 'Acceso prohibido' });
  }
}





app.get('/carpetas',  requireAuth, esUsuarioAutorizadoCarpeta,  async (req, res) =>{
 

    const id_carpeta = req.query.id_carpeta;
    const ruc = req.session.user;

    const usuarioIdEnURL = parseInt(req.query.id); // Obtener el ID de la URL y convertirlo a número entero
        const usuarioIdAutenticado = req.session.id;
    
 


    const carpetas = await getAllCarpetas(id_carpeta);
    const reportes = await getAllReportes(id_carpeta);

    const rango = carpetas.length
    const rango2 = reportes.length

    
    //  const filtro_reportes = filterReportes(id);
    res.render('carpetas', { carpetas, ruc, rango, rango2 });
} ) 

//hola

app.get('/carpetas/sede',  requireAuth, esUsuarioAutorizado,  async (req, res) =>{
    const id = req.query.id;
    const ruc = req.session.user;
    const nombre = req.session.nombre_empresa;

    const usuarioIdEnURL = parseInt(req.query.id); // Obtener el ID de la URL y convertirlo a número entero
        const usuarioIdAutenticado = req.session.id;
    
 


    const carpetas = await getAllCarpetasSede(id);
    const reportes = await getAllReportes(id);

    const rango = carpetas.length
    const rango2 = reportes.length

    
    //  const filtro_reportes = filterReportes(id);
    res.render('carpetas_principal', { carpetas, ruc, rango, rango2, nombre, id });
} ) 





















router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = await deleteUser(id);
        if (query === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        return res.status(200).json({ message: 'user deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
});




app.get('/', (req, res) => {
    res.render('login');
});


app.use('/usuarios', requireAuth, usuarios)



/*

const connection =  mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10, // Puedes ajustar este límite según tus necesidades
    queueLimit: 0
    

    
    
});*/

// Conectar a la base de datos


//connection.connect();


/*
const connection = mysql.createConnection({
    host: "roundhouse.proxy.rlwy.net",
    port: 47689,
    database: "railway",
    user: "root",
    password: "gH5DcCf42-Ff2gE3hAbE1h5664bFB55g",

    
    
});*/



/*

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});*/





/*
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
    
});

*/

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directorio donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Nombre del archivo en la carpeta
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Límite del tamaño del archivo a 50 MB
});

// Ruta para manejar la carga de archivos
app.post('/uploads', upload.single('file'), (req, res) => {
  // Aquí puedes manejar el archivo subido
  const file = req.file;
  if (!file) {
    return res.status(400).send('No se ha seleccionado ningún archivo.');
  }
  // Procesa el archivo y realiza las operaciones necesarias en tu base de datos
  // ...
  res.status(200).send('Archivo subido correctamente.');
});

app.get('/usuarios/carpetas/crear_reportes/:carpeta/:sede', (req, res) => {
    const { carpeta } = req.params;
    const { sede } = req.params;
    res.render('carga_archivos', {carpeta, sede});
    
    
});


/*


// Configurar autenticación de Google Drive usando el archivo JSON de credenciales

const credentials = require(path.join(__dirname, "client_secret_526647581442-v4n40cen9rf515nhi30s97q5pl3gk2rf.apps.googleusercontent.com.json"));
//console.log("Ruta completa del archivo:", path.join(__dirname, "public/client_secret_526647581442-v4n40cen9rf515nhi30s97q5pl3gk2rf.apps.googleusercontent.com.json"));
const { client_id, client_secret, auth_uri } = credentials.web;


const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, auth_uri);

*/



const apikeys2 = require(path.join(__dirname, "apikey.json"));
const SCOPE = ['https://www.googleapis.com/auth/drive'];
async function authorize(){
    const jwtClient = new google.auth.JWT(
        apikeys2.client_email,
        null,
        apikeys2.private_key,
        SCOPE

    );
    await jwtClient.authorize();
    return jwtClient; 
}
//const ruta = require(path.join(__dirname, "uploads/test.txt"))









app.get("/auth2", (req, res) => {
    console.log("esta es mi ruta", ruta);
    authorize()
        .then((authClient) => {
            uploadFile(authClient, (err, file) => {
                if (err) {
                    console.error("Error al subir el archivo:", err);
                    res.send("Error al subir el archivo a Google Drive");
                } else {
                    console.log("Archivo subido correctamente. ID:", file.data.id);
                    const uploadedFileUrl = `https://drive.google.com/uc?id=${file.data.id}`;
                    res.json({ message: "Archivo subido correctamente a Google Drive", fileUrl: uploadedFileUrl });
                }
            });
        })
        .catch((error) => {
            console.error("Error de autorización:", error);
            res.send("Error de autorización");
        });
});


app.post('/usuarios/carpetas/crear_reportes/:carpeta/:sede', async (req, res) => {


    const { carpeta } = req.params;
    const { sede } = req.params;
    const file = req.files.file;
    const nombreOriginal = file.name;

    if (!req.files || !req.files.file) {
        return res.status(400).send('No se ha seleccionado ningún archivo.');
    }

    function decodificarCaracteresEspeciales(nombreOriginal) {
        // Reemplaza los caracteres codificados incorrectamente
        const decodedString = nombreOriginal.replace(/Ã‰/g, 'É').replace(/Ã/g, 'Í');
        return decodedString;
    }

    // Función para limpiar el nombre del archivo
    function limpiarNombreArchivo(nombreOriginal) {
        // Decodificar caracteres especiales
        const nombreDecodificado = decodificarCaracteresEspeciales(nombreOriginal);
        // Remover caracteres no permitidos (por ejemplo, ../ y ../)
        const nombreLimpio = nombreDecodificado.replace(/[^a-z0-9.-]/gi, '_');
        return nombreLimpio;
    }

    const nombreLimpio = limpiarNombreArchivo(nombreOriginal);
    console.log("este es mi nombre: ", nombreLimpio)
    console.log(file)
    //const uploadPath = path.join(__dirname, 'uploads',nombreLimpio); // Especifica la carpeta de destino
    //const ruta = "/uploads/" + nombreLimpio   

    

    //file.mv(uploadPath, (err) => {
       // if (err) {
            //return res.status(500).send(err);
       // }

        async function uploadFile(authClient, callback){
            return new Promise((resolve, rejected)=> {
                const drive = google.drive({version: 'v3', auth:authClient})
        
                var fileMetadata = {
                    name: nombreLimpio,
                    parents:["1QAgLUhYgT03p-GQSA-jyP34xXM0E8M8D"]
                }
        
                drive.files.create({
                    resource:fileMetadata,
                    media: {
                        //body: fs.createReadStream(uploadPath),
                        body: Readable.from(file.data),
                        mimeType:'application/pdf'
                    },
                    fields:'id'
                }, function(err, file){
                    if (err) {
                        callback(err, null); // Llama al callback con el error
                    } else {
                        callback(null, file); // Llama al callback con el archivo subido
                    }
                });
        
            })
        }

        authorize()
        .then( async (authClient) => {
            uploadFile(authClient,  async(err, file) => {
                if (err) {
                    console.error("Error al subir el archivo:", err);
                    //res.send("Error al subir el archivo a Google Drive");
                } else {

                    
                        const authClient = await authorize();
                        //const fileId = req.query.id; // Obtener el ID del archivo desde la consulta
                        const fileId = "1022AX2H6y3dvkkJ25iPRL3XGQ-UEOFXs";
                
                        // Configurar el archivo como público (cualquiera con el enlace puede verlo)
                        await setFilePermissions(authClient, file.data.id);
                
                
                
                        const uploadFileToDatabase = async (sede, nombreLimpio, carpeta, file) => {
                            let connection;
                            try {
                              const uploadedFileUrl = `https://drive.google.com/uc?id=${file.data.id}`;
                              const id_drive = file.data.id;
                          
                              const sql = 'INSERT INTO reportes (id_carpeta_nombre, nombre, id_carpeta,  ruta, id_drive) VALUES (?, ?, ?, ?, ?)';
                              const values = [sede, nombreLimpio, carpeta, uploadedFileUrl, id_drive];
                          
                              connection = await pool.getConnection();
                              const [result] = await connection.execute(sql, values);
                          
                              console.log('Archivo subido a la base de datos');
                              return `Archivo ${file.name} subido correctamente.`;
                            } catch (error) {
                              console.error('Error al subir el archivo a la base de datos:', error);
                              throw new Error('Error al subir el archivo a la base de datos');
                            } finally {
                              if (connection) {
                                connection.release();
                                
                               
                              }

                              
                            }
                          };
                          
                          // Llamada a la función
                          try {
                            const message = await uploadFileToDatabase(sede, nombreLimpio, carpeta, file);
                           
                            //res.status(200).send(message);
                            res.redirect(`/usuarios/carpetas/detalle/${carpeta}/${sede}`);
                            return;
                            
                          } catch (error) {
                            res.status(500).send('Error al subir el archivo a la base de datos');
                          }
                }
            });
        })
        .catch((error) => {
            console.error("Error de autorización:", error);
            res.send("Error de autorización");
        });


        const fileUrl = `https://drive.google.com/uc?id=${file.data.id}`;

        console.log(nombreLimpio)
        //return res.redirect(`/usuarios/carpetas/detalle/${carpeta}/${sede}`);
        //console.log('Archivo subido correctamente:', ruta);

        // Inserta la información del archivo en tu base de datos
        
        
    //});
});

async function setFilePermissions(authClient, fileId) {
    const drive = google.drive({ version: "v3", auth: authClient });

    // Configurar el archivo como público (cualquiera con el enlace puede verlo)
    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });
}


async function deleteFile(authClient, fileId) {
    const drive = google.drive({ version: 'v3', auth: authClient });

    try {
        await drive.files.delete({
            fileId: fileId
        });
        console.log(`Archivo con ID ${fileId} eliminado correctamente.`);
    } catch (error) {
        console.error(`Error al eliminar el archivo con ID ${fileId}:`, error);
    }
}


//mostrar


app.get("/auth3", async (req, res) => {
    try {
        const authClient = await authorize();
        //const fileId = req.query.id; // Obtener el ID del archivo desde la consulta
        const fileId = "1022AX2H6y3dvkkJ25iPRL3XGQ-UEOFXs";

        // Configurar el archivo como público (cualquiera con el enlace puede verlo)
        await setFilePermissions(authClient, fileId);

        const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
        console.log("Archivo visible en la URL:", fileUrl);
        res.json({ message: "Archivo visible en la URL:", fileUrl }); 
    } catch (error) {
        console.error("Error al configurar los permisos del archivo:", error);
        res.status(500).json({ error: "Error al configurar los permisos del archivo." });
    }
});


//idprueba
//1_B44DdjfvtJw3gBTpD_GAvYwAVby_emQ

app.get("/delete/:fileId", (req, res) => {
    const fileId = req.params.fileId;

    authorize()
        .then((authClient) => {
            deleteFile(authClient, fileId);
            res.send(`Eliminando el archivo con ID: ${fileId}`);
        })
        .catch((error) => {
            console.error("Error de autorización:", error);
            res.send("Error de autorización");
        });
});


/*
app.get("/auth", (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/drive.file"],
    });
    res.redirect(authUrl);
  });

  */



// Ruta de redireccionamiento después de la autenticación
app.get("/oauthcallback", async (req, res) => {
    const code = req.query.code;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    res.send("Autenticado exitosamente. Puedes subir archivos ahora.");
  });
  






  // Ruta para subir archivos PDF
app.post("/upload", upload.single("pdf"), async (req, res) => {
    const drive = google.drive({ version: "v3", auth: oAuth2Client });
    const fileMetadata = { 
      name: req.file.originalname,
    };
    const media = {
      mimeType: req.file.mimetype,
      body: req.file.buffer,
    };
    try {
      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      });
      console.log("Archivo subido con éxito. ID del archivo: ", response.data.id);
      res.send("Archivo subido con éxito.");
    } catch (error) {
      console.error("Error al subir el archivo: ", error.message);
      res.status(500).send("Error al subir el archivo.");
    }
  });
  
 









app.post('/uploads2', upload.single('file'), (req, res) => {
    const file = req.file; // Contiene la información del archivo subido
    const filePath = file.path; // Ruta del archivo en la carpeta de uploads
    const id_usuario = 1;
    const id_carpeta= 1;
    
    // Insertar la ruta del archivo en la base de datos
    const sql = 'INSERT INTO reportes (id_usuario, nombre, id_carpeta,  ruta) VALUES (?, ?, ?, ?)';
    const values = [id_usuario,file.originalname,id_carpeta, filePath];
    
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al subir el archivo a la base de datos');
      } else {
        console.log('Archivo subido a la base de datos');
        res.status(200).send('Archivo subido correctamente');
      }

      
    });
  });







  app.post('/login', async (req, res) => {
    const ruc = req.body.ruc;
    const password = req.body.password;
  
    try {
      const [results] = await pool.execute('SELECT * FROM usuarios WHERE ruc = ? ', [ruc]);
  
      if (results.length > 0) {
        const user = results[0];
        const hashedPassword = user.password;
  
        const isPasswordCorrect = bcrypt.compareSync(password, hashedPassword);
  
        req.session.user = ruc;
        req.session.admin = user.id_rol;
        req.session.primary = user.id;
        req.session.nombre_empresa = user.nombre_empresa;
  
        const id = user.id;
  
        if (isPasswordCorrect) {
          if (user.id_rol == 2) {
            res.redirect('/usuarios');
          } else {
            res.redirect(`/carpetas/sede?id=${id}`);
          }
        } else {
          res.send('Tu contraseña es incorrecta.');
        }
      } else {
        res.send('El ruc que proporcionaste es incorrecto.');
      }
    } catch (error) {
      console.error('Error en el proceso de inicio de sesión:', error);
      res.status(500).send('Error en el servidor.');
    }
  });
  
  

router.post('/login2', async (req, res) => {
    const { ruc, password } = req.body;

    try {
        // Consulta la base de datos para encontrar el usuario
        const user = await querys.getUserByRuc(ruc);

        if (user) {
            const hashedPassword = user.password;

            // Compara la contraseña proporcionada con el hash almacenado
            const match = await bcrypt.compare(password, hashedPassword);

            if (match) {
                req.session.user = ruc;

                const id = user.id;

                if (user.id_rol == 2) {
                    res.redirect('/usuarios');
                } else {
                    res.redirect(`/carpetas?id=${id}`);
                }
            } else {
                res.send('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
            }
        } else {
            res.send('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
});


app.get('/usuarios/eliminar_carpeta/sede/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      if (!id) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
  
      const sql = 'SELECT * FROM reportes WHERE id_carpeta IN (SELECT id FROM carpetas WHERE id_carpeta_nombre = ?);';
  
      const [results] = await pool.execute(sql, [id]);
  
      const fs = require('fs');
      const path = require('path');
      const rutaDirectorioUploads = path.resolve(__dirname, 'uploads');
  
      for (let i = 0; i < results.length; i++) {
        const carpeta = results[i];
        console.log(carpeta);
        
        const rutaArchivo = path.join(rutaDirectorioUploads, `${carpeta.nombre}`);
        const nombreDelArchivo = carpeta.id_drive;
  
        try {
          const authClient = await authorize();
          await deleteFile(authClient, nombreDelArchivo);
          console.log(`Eliminando el archivo con ID: ${nombreDelArchivo}`);
        } catch (error) {
          console.error("Error de autorización:", error);
          // Maneja el error según tu lógica de la aplicación
        }
      }
  
      // Utiliza Promise.all para esperar a que todas las operaciones de eliminación se completen
      await Promise.all(results.map(async (carpeta) => {
        const rutaArchivo = path.join(rutaDirectorioUploads, `${carpeta.nombre}`);
        const nombreDelArchivo = carpeta.id_drive;
  
        try {
          const authClient = await authorize();
          await deleteFile(authClient, nombreDelArchivo);
          console.log(`Eliminando el archivo con ID: ${nombreDelArchivo}`);
        } catch (error) {
          console.error("Error de autorización:", error);
          // Maneja el error según tu lógica de la aplicación
        }
      }));
  
      // Elimina la carpeta de la base de datos después de que todos los archivos se hayan eliminado
      const [result] = await pool.execute(`DELETE FROM carpeta_nombre WHERE id = ?;`, [id]);
  
      console.log("iddd", id);
  
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: 'Carpeta eliminada2' });
      }
  
      return res.status(200).json({ message: 'Carpeta deleted successfully' });
    } catch (error) {
      console.error("Error deleting carpeta:", error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  


  app.get('/usuarios/eliminar_carpeta/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      if (!id) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
  
      const sql = 'SELECT * FROM reportes WHERE id_carpeta = ?';
  
      const [results] = await pool.execute(sql, [id]);
  
      const fs = require('fs');
      const path = require('path');
      const rutaDirectorioUploads = path.resolve(__dirname, 'uploads');
  
      for (let i = 0; i < results.length; i++) {
        const carpeta = results[i];
        console.log(carpeta);
  
        const rutaArchivo = path.join(rutaDirectorioUploads, `${carpeta.nombre}`);
        const nombreDelArchivo = carpeta.id_drive;
  
        try {
          const authClient = await authorize();
          await deleteFile(authClient, nombreDelArchivo);
          console.log(`Eliminando el archivo con ID: ${nombreDelArchivo}`);
        } catch (error) {
          console.error("Error de autorización:", error);
          // Maneja el error según tu lógica de la aplicación
        }
      }
  
      // Utiliza Promise.all para esperar a que todas las operaciones de eliminación se completen
      await Promise.all(results.map(async (carpeta) => {
        const rutaArchivo = path.join(rutaDirectorioUploads, `${carpeta.nombre}`);
        const nombreDelArchivo = carpeta.id_drive;
  
        try {
          const authClient = await authorize();
          await deleteFile(authClient, nombreDelArchivo);
          console.log(`Eliminando el archivo con ID: ${nombreDelArchivo}`);
        } catch (error) {
          console.error("Error de autorización:", error);
          // Maneja el error según tu lógica de la aplicación
        }
      }));
  
      // Elimina la carpeta de la base de datos después de que todos los archivos se hayan eliminado
      const [result] = await pool.execute(`DELETE FROM carpetas WHERE id = ?;`, [id]);
  
      console.log("iddd", id);
  
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: 'Carpeta eliminada2' });
      }
  
      return res.status(200).json({ message: 'Carpeta deleted successfully' });
    } catch (error) {
      console.error("Error deleting carpeta:", error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  


  app.get('/usuarios/eliminar_reporte/:id/:nombre', async (req, res) => {
    const fs = require('fs');
    const { id, nombre } = req.params;
    const nombreDelArchivo = nombre;
    const path = require('path');
    const rutaDirectorioUploads = path.resolve(__dirname, 'uploads');
    const rutaArchivo = path.join(rutaDirectorioUploads, `${nombreDelArchivo}`);
  
    async function authorize() {
      const jwtClient = new google.auth.JWT(
        apikeys2.client_email,
        null,
        apikeys2.private_key,
        SCOPE
      );
      await jwtClient.authorize();
      return jwtClient;
    }
  
    try {
      const authClient = await authorize();
      await deleteFile(authClient, nombreDelArchivo);
      console.log(`Eliminando el archivo con ID: ${nombreDelArchivo}`);
  
      // Elimina el reporte de la base de datos después de que el archivo se haya eliminado
      const [result] = await pool.execute(`DELETE FROM reportes WHERE id = ?;`, [id]);
  
      console.log("iddd", id);
  
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: 'reporte eliminado' });
      }
  
      return res.status(200).json({ message: 'reporte deleted successfully' });
    } catch (error) {
      console.error("Error deleting reporte:", error);
  
      // Maneja el error según tu lógica de la aplicación
      fs.unlink(rutaArchivo, (err) => {
        if (err) {
          console.error('Error al eliminar el archivo:', err);
        } else {
          console.log('Archivo eliminado correctamente');
        }
      });
  
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  


  app.get('/usuarios/delete2/:id', requireAuth, esAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(id); // Agrega esto para verificar el valor de id
  
    try {
      // Consulta la base de datos para obtener los reportes asociados al usuario
      const [results] = await pool.execute('SELECT r.* FROM reportes r JOIN carpeta_nombre cn ON r.id_carpeta_nombre = cn.id WHERE cn.id_usuario = ?;', [id]);

      
  
      // Utiliza Promise.all para esperar a que todas las operaciones de eliminación se completen
      await Promise.all(results.map(async (carpeta) => {
        //const rutaArchivo = path.join(rutaDirectorioUploads, `${carpeta.nombre}`);
        const nombreDelArchivo = carpeta.id_drive;
  
        try {
          const authClient = await authorize();
          await deleteFile(authClient, nombreDelArchivo);
          console.log(`Eliminando el archivo con ID: ${nombreDelArchivo}`);
        } catch (error) {
          console.error("Error de autorización:", error);
          // Maneja el error según tu lógica de la aplicación
        }
      }));
  
      // Elimina al usuario de la base de datos después de que todos los archivos se hayan eliminado
      const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
  
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: 'user not found' });
      }
  
      return res.status(200).json({ message: 'user deleted successfully xdddd' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'internal server error' });
    }
  });
  



// Cierre de sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err, );
        } else {
            res.redirect('/'); // Redirige al usuario a la página de login después de cerrar sesión
        }
    });
    pool.end(() => {
      console.log('Pool de conexiones cerrado.');
      process.exit(0);
    });
});






app.listen(PORT, () => {
    console.log(`Executando el puerto ${PORT}`)
})


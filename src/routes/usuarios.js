const { Router } = require('express');
const express = require('express');
const path = require('path');
const querys = require('../querys');
const { render } = require('ejs');
const router = Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mysql = require('mysql2');



const config = require('../config');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = config;


router.get('/', async (req, res) => {
    const query = await querys.getAllUsuarios();
    return res.status(200).json(query)
})


router.use(express.static(path.join(__dirname, 'public')));


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


router.post('/agregar_usuario',  async (req, res) => {
    const { nombre, rol, ruc, password } = req.body;

    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    

    try {
        // Genera un hash seguro de la contraseña antes de almacenarla
       // const hashedPassword = await bcrypt.hash(password, saltRounds);
       const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Luego, puedes almacenar 'hashedPassword' en tu base de datos
        const query = await querys.createUser(nombre, rol, ruc, hashedPassword);
        
        //return res.status(200).json(query);
        return res.redirect('/usuarios'),res.write('<script>window.setTimeout(function(){location.reload();},2000);</script>'),res.end() ;
        
       
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.get('/mensajes',  async (req, res) => {
    try {
       
        const mensajes = await querys.getAllComentarios();
        
        if (mensajes === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        res.render('mensajes', { mensajes});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
});



router.post('/editar', async (req, res) => {
    const { id, nombre, rol, ruc, password } = req.body;


    const usuarios = await querys.getUsuariosById(id);

    const usuario2 = usuarios[0];
    const password2 = usuario2.password;
    console.log(password2)
    console.log("este es mi passwordp")

    if(password2 == password){
        const query = await querys.updateUser(id, nombre, rol, ruc, password);
        if (query === null) {
            return res.status(400).json({ message: 'usuario not found' });
        }
    } else {

        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const query = await querys.updateUser(id, nombre, rol, ruc, hashedPassword);
        if (query === null) {
            return res.status(400).json({ message: 'usuario not found' });
        }

    }
    return res.redirect('/usuarios'),res.write('<script>window.setTimeout(function(){location.reload();},2000);</script>'),res.end() ;
    //return res.status(200).json({ message: 'actor register successfully' });
});




router.get('/user', async (req, res) => {
    const query = await querys.getAllUsuarios();
    return res.status(200).json(query)
})


/*


const connection = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10, // Puedes ajustar este límite según tus necesidades
    queueLimit: 0

    
    
});
]/
/*
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});*/

// Conectar a la base de datos
//connection.connect();






router.get('/detalle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const login = await querys.detalleUsuarios(id);
        const ruc = req.session.user;
        if (login === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        return  res.render('detalle', { login, ruc });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
   
})

function esUsuarioAutorizado(req, res, next) {
    const usuarioIdEnURL = parseInt(req.query.id); // Obtener el ID de la URL y convertirlo a número entero
    const usuarioIdAutenticado = req.session.id; // Obtener el ID del usuario autenticado desde la sesión o el token

    console.log("ESTOS SO  MIS DATOS")
    console.log(usuarioIdEnURL)
    console.log(usuarioIdAutenticado)

    next();

    if (usuarioIdEnURL === usuarioIdAutenticado) {
        // El usuario autenticado tiene permiso para acceder a esta ruta
        next();
    } else {
        // Acceso prohibido si el ID en la URL no coincide con el ID del usuario autenticado
        res.status(403).json({ mensaje: 'Acceso prohibido' });
    }
}


router.get('/carpetas/:id', async (req, res) => {
    try {

        

        const { id } = req.params;
        const ruc = req.session.user;

        console.log("este es mi id")
        console.log(req.session.id_rol)
        
        const carpetas = await querys.detalleCarpetas(id);
        const idCarpeta = req.query.idCarpeta; 
        console.log("este es mi carpta")

        const reportes = await querys.detalleSubCarpetas(idCarpeta);
        
        if (carpetas === null) {
            return res.status(400).json({ message: 'user not found' });
        }


        return res.send(`
    <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly; padding: 10px; max-width: 100%; max-height: 1000px;">
        ${reportes.map(reporte => `
            <div style="margin: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; text-align: center; width: 200px; background-color: #f9f9f9;">
                <img src="/imagenes/pdf.png" width="50px" alt="Icono de PDF" style="margin-bottom: 10px;">
                <p style="margin-bottom: 10px;">${reporte.nombre}</p>
                <button onclick="verReporte('${reporte.ruta}')" style="background-color: #007bff; color: #fff; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer;">Ver en pantalla completa</button>
            </div>
        `).join('')}
    </div>  
    <script>
        function verReporte(url) {
            // Abre el reporte en pantalla completa
            window.open(url, '_blank', 'fullscreen=yes');
        }
    </script>
`);



    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error 2' });
    }
   
})

router.get('/carpetas/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const ruc = req.session.user;
        const carpetas = await querys.detalleCarpetas(id);
        const idCarpeta = req.query.idCarpeta; 
        

        //const reportes = await querys.detalleSubCarpetas(idCarpeta);
        
        if (carpetas === null) {
            return res.status(400).json({ message: 'user not found' });
        }


        return  res.render('detalle_carpetas', { carpetas, id });
        /*return res.send(`
        <div style="display: flex; flex-direction: row; padding="20px" ">
            ${reportes.map(reporte => `
            <div style="margin-right: 10px;">
                <img src="/imagenes/pdf.png" width="150px"> </img>
                <span>${reporte.nombre}</span>
                <button onclick="verReporte('${reporte.ruta}')">Ver en pantalla completa</button>
            </div>
            `).join('')}
        </div>  
        <script>
            function verReporte(url) {
            // Abre el reporte en pantalla completa
            window.open(url, '_blank', 'fullscreen=yes');
            }
        </script>
        `);*/
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error 2' });
    }
   
})


router.get('/carpetas/sede/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const ruc = req.session.user;
        const carpetas = await querys.detalleCarpetasSede(id);
        const idCarpeta = req.query.idCarpeta; 
        

        //const reportes = await querys.detalleSubCarpetas(idCarpeta);
        
        if (carpetas === null) {
            return res.status(400).json({ message: 'user not found' });
        }


        return  res.render('detalle_carpetas_sede', { carpetas, id });
        /*return res.send(`
        <div style="display: flex; flex-direction: row; padding="20px" ">
            ${reportes.map(reporte => `
            <div style="margin-right: 10px;">
                <img src="/imagenes/pdf.png" width="150px"> </img>
                <span>${reporte.nombre}</span>
                <button onclick="verReporte('${reporte.ruta}')">Ver en pantalla completa</button>
            </div>
            `).join('')}
        </div>  
        <script>
            function verReporte(url) {
            // Abre el reporte en pantalla completa
            window.open(url, '_blank', 'fullscreen=yes');
            }
        </script>
        `);*/
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error 2' });detalle
    }
   
})




router.get('/carpetas/detalle/:id/:id_usuario', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.params;
        const carpetas = await querys.detalleSubCarpetas(id);
        if (carpetas === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        return  res.render('reportes_admin', { carpetas,id, id_usuario });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
   
})



router.get('/carpetas/detalle2/:id/:id_usuario', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.params;
        const carpetas = await querys.detalleSubCarpetas(id);
        if (carpetas === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        return  res.render('reportes_admin', { carpetas,id, id_usuario });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
   
})




router.get('/carpetas/detalle_user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const carpetas = await querys.detalleSubCarpetas(id);
        if (carpetas === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        return  res.render('reportes_user', { carpetas });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
   
}) 
//muy byebis duas

router.get('/carpetas/detalle_user', async (req, res) => {
    try {
        const { id } = req.query.idCarpeta;
        const reportes = await querys.detalleSubCarpetas(id);

        console.log("si esta enviando la señal de detalle_user")

        if (reportes === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        //return  res.render('reportes_user', { carpetas });
        res.send(`<ul>${reportes.map(reporte => `<li>${reporte}</li>`).join('')}</ul>`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
   
}) 


router.get('/carpetas2', async (req, res) => {
    try {
        const { id } = req.query.idCarpeta;
        const reportes = await querys.detalleSubCarpetas(id);

        

        if (reportes === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        //return  res.render('reportes_user', { carpetas });
        res.send(`<ul>${reportes.map(reporte => `<li>${reporte}</li>`).join('')}</ul>`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
   
}) 


router.get('/ver_reporte222', async (req, res) => {
    const { ruta } = req.body;
    // Realiza las acciones que necesites con la ruta en el servidor
    //res.render('ver_reporte', { ruta })
    //console.log('Ruta recibida en el servidor2:', ruta);
    //res.render('ver_reporte', {ruta});
    //console.log('Ruta recibida en el servidor:', ruta);
    //res.send('Ruta recibida correctamente en el servidor');
});



router.post('/ver_reporte', async (req, res) => {
    const { ruta } = req.body;
    // Realiza las acciones que necesites con la ruta en el servidor
    //res.render('ver_reporte', { ruta })
   
    //console.log('Ruta recibida en el servidor:', ruta);
    //res.send('Ruta recibida correctamente en el servidor');
    res.render('ver_reporte', { ruta })
});

router.get('/ver_reporte', (req, res) => {
    // Lógica para manejar la solicitud GET aquí
    res.render('ver_reporte', { /* datos para renderizar la plantilla */ });
});


router.get('/carpetass/crear_reportes/:id/:id_usuario22', async (req, res) => {
    try {
        const { id } = req.params;
        const carpetas = await querys.detalleSubCarpetas(id);
        if (carpetas === null) {
            return res.status(400).json({ message: 'user not found' });
        }
        return  res.render('reportes_user', { carpetas });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }
   
})



router.get('/crear_carpeta/:id', async (req, res) => {
    const { id } = req.params;

    res.render('form_carpeta', {id})

})

router.post('/crear_carpeta', async (req, res) => {

    try {
        const { id, fecha } = req.body;
        const id2 = 4;
        console.log(id2)
        

        console.log("gaaaaaaaaaaaaaa")
        console.log(id) 
        console.log(fecha)
        const carpetas = await querys.createCarpeta(id,fecha);
        if (carpetas === null) {
            return res.status(400).json({ message: 'carpeta not found' });
        }
        return res.redirect(`carpetas/admin/${id}`),res.write('<script>window.setTimeout(function(){location.reload();},2000);</script>'),res.end() ;
        //res.json({ success: true, message: 'Carpeta creada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }

})


router.post('/crear_carpeta23242', async (req, res) => {

    try {
        const { id, fecha } = req.body;
        const id2 = 4;
        console.log(id2)
        

        console.log("gaaaaaaaaaaaaaa")
        console.log(id) 
        console.log(fecha)
        const carpetas = await querys.createCarpeta(id,fecha);
        if (carpetas === null) {
            return res.status(400).json({ message: 'carpeta not found' });
        }
        return res.redirect(`carpetas/admin/${id}`),res.write('<script>window.setTimeout(function(){location.reload();},2000);</script>'),res.end() ;
        //res.json({ success: true, message: 'Carpeta creada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }

})




router.get('/crear_carpeta/sede/:id', async (req, res) => {
    const { id } = req.params;

    res.render('form_carpeta_sede', {id})

})




router.post('/crear_carpeta/sede/', async (req, res) => {

    try {
        const { id, nombre } = req.body;
        const id2 = 4;
        

        console.log("gaaaaaaaaaaaaaa")
        console.log(id) 
        console.log(nombre)
        const carpetas = await querys.createCarpetaSede(id,nombre);
        if (carpetas === null) { 
            return res.status(400).json({ message: 'carpeta not found' });
        }
        return res.redirect(`/usuarios/carpetas/sede/${id}`),res.write('<script>window.setTimeout(function(){location.reload();},2000);</script>'),res.end() ;
        //res.json({ success: true, message: 'Carpeta creada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error' });
    }

})


router.post('/crear_comentario', async (req, res) => {
    try {
      const { id, comentario } = req.body;
  
      // Aquí deberías realizar tu lógica de almacenamiento de comentario
  
      // Supongamos que la lógica fue exitosa
      const comentarioGuardado = await querys.createComentario(id, comentario);
  
      if (!comentarioGuardado) {
        return res.status(400).json({ success: false, message: 'Error al guardar el comentario' });
      }
  
      return res.status(200).json({ success: true, message: 'Comentario enviado correctamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });






module.exports = router; 
const pool = require('./connection');

const getAllUsuarios = async () => {
  try {
    const [query] = await pool.execute('SELECT * FROM usuarios');
    return query;
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    throw error; // Lanza el error para que puedas verlo en la consola o manejarlo según tus necesidades
  }
};


const getAllComentarios = async () => {
  try {
    const [query] = await pool.execute('SELECT * FROM comentarios');
    return query;
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    throw error; // Lanza el error para que puedas verlo en la consola o manejarlo según tus necesidades
  }
};






const todosReportes = async () => {
  try {
    const [query] = await pool.execute('SELECT * FROM reportes');
    return query;
  } catch (error) {
    console.error('Error al obtener todos los reportes:', error);
    throw error;
  }
};

const todosCarpetas = async () => {
  try {
    const [query] = await pool.execute('SELECT * FROM carpetas');
    return query;
  } catch (error) {
    console.error('Error al obtener todas las carpetas:', error);
    throw error;
  }
};

const getAllCarpetasSede = async (id) => {
  try {
    const [query] = await pool.execute(`SELECT * FROM carpeta_nombre WHERE id_usuario = ?`, [id]);
    return query;
  } catch (error) {
    console.error('Error al obtener todas las carpetas de la sede:', error);
    throw error;
  }
};

const getAllCarpetas = async (id) => {
  try {
    // Verifica que id no sea undefined antes de ejecutar la consulta
    if (id === undefined) {
      throw new Error('El parámetro id no puede ser undefined.');
    }

    const [query] = await pool.execute(`SELECT * FROM carpetas WHERE id_carpeta_nombre = ?`, [id]);
    return query;
  } catch (error) {
    console.error('Error al obtener todas las carpetas:', error);
    throw error;
  }
};


//SELECT * FROM reportes WHERE id_carpeta_nombre IN (SELECT id FROM carpeta_nombre WHERE id_usuario = ?);


const getAllReportes2 = async (id) => {
    const [query] = await connection.execute(`SELECT * FROM reportes WHERE id_usuario = ? `, [id]);
    return query
};


const getAllReportes = async (id) => {
  try {
    const [query] = await pool.execute(
      `SELECT * FROM reportes WHERE id_carpeta_nombre IN (SELECT id FROM carpeta_nombre WHERE id_usuario = ?); `,
      [id]
    );

    return query;
  } catch (error) {
    console.error('Error en la consulta:', error);
    throw error;
  }
};

const getAllReportesCarpeta = async (id) => {
  try {
    const [query] = await pool.execute(
      `SELECT * FROM reportes WHERE id_carpeta = ? `,
      [id]
    );

    return query;
  } catch (error) {
    console.error('Error en la consulta:', error);
    throw error;
  }
};

const getUsuariosById = async (id) => {
  try {
    const [query] = await pool.execute(
      `SELECT * FROM usuarios WHERE id = ?`,
      [id]
    );

    return query;
  } catch (error) {
    console.error('Error en la consulta:', error);
    throw error;
  }
};

const detalleUsuarios = async (id) => {
  try {
    const [query] = await pool.execute(
      `SELECT * FROM usuarios WHERE id = ?`,
      [id]
    );

    return query;
  } catch (error) {
    console.error('Error en la consulta:', error);
    throw error;
  }
};

  


const detalleCarpetas = async (id) => {
  try {
    const [query] = await pool.execute(
      `SELECT * FROM carpetas WHERE id_carpeta_nombre = ?`,
      [id]
    );

    return query;
  } catch (error) {
    console.error('Error en la consulta:', error);
    throw error;
  }
};

const detalleCarpetasSede = async (id) => {
  try {
    const [query] = await pool.execute(
      `SELECT * FROM carpeta_nombre WHERE id_usuario = ?`,
      [id]
    );

    return query;
  } catch (error) {
    console.error('Error en la consulta:', error);
    throw error;
  }
};

const detalleSubCarpetas = async (id) => {
  try {
    const [query] = await pool.execute(
      `SELECT * FROM reportes WHERE id_carpeta = ?`,
      [id]
    );

    return query;
  } catch (error) {
    console.error('Error en la consulta:', error);
    throw error;
  }
};

const createUser = async (nombre, rol, ruc, password) => {
  try {
    const [query] = await pool.execute(
      `INSERT INTO usuarios (nombre_empresa, id_rol, ruc, password) VALUES (?, ?, ?, ?)`,
      [nombre, rol, ruc, password]
    );

    const item = await getUsuariosById(query.insertId);
    return item;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

const createCarpeta = async (id, fecha) => {
  try {
    // Verifica que los valores no sean undefined
    if (id !== undefined && fecha !== undefined) {
      const [query] = await pool.execute(
        `INSERT INTO carpetas (id_carpeta_nombre, fecha) VALUES (?, ?)`,
        [id, fecha]
      );

      const item = await getUsuariosById(query.insertId);
      return item;
    } else {
      // Si alguno de los valores es undefined, lanza un error o maneja el caso según tus necesidades
      throw new Error('Los valores de id y fecha no pueden ser undefined.');
    }
  } catch (error) {
    console.error('Error al crear carpeta:', error);
    throw error;
  }
};



const createCarpetaSede = async (id, nombre) => {
  try {
    // Verifica que los valores no sean undefined
    if (id !== undefined && nombre !== undefined) {
      const [query] = await pool.execute(
        `INSERT INTO carpeta_nombre (id_usuario, nombre) VALUES (?, ?)`,
        [id, nombre]
      );

      const item = await getUsuariosById(query.insertId);
      return item;
    } else {
      // Si alguno de los valores es undefined, lanza un error o maneja el caso según tus necesidades
      throw new Error('Los valores de id y nombre no pueden ser undefined.');
    }
  } catch (error) {
    console.error('Error al crear carpeta sede:', error);
    throw error;
  }
};


const createComentario = async (id, comentario) => {
  try {
    // Verifica que los valores no sean undefined
    if (id !== undefined && comentario !== undefined) {
      const [query] = await pool.execute(
        `INSERT INTO comentarios (id_usuario, comentario) VALUES (?, ?)`,
        [id, comentario]
      );

      const item = await getUsuariosById(query.insertId);
      return item;
    } else {
      // Si alguno de los valores es undefined, lanza un error o maneja el caso según tus necesidades
      throw new Error('Los valores de id y nombre no pueden ser undefined.');
    }
  } catch (error) {
    console.error('Error al crear carpeta sede:', error);
    throw error;
  }
};



const login = async (ruc, password) => {
  try {
    const [query] = await pool.execute(`SELECT * FROM usuarios WHERE ruc = ? and password = ?`, [ruc, password]);

    if (query.length > 0) {
      return true;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error en el proceso de inicio de sesión:', error);
    throw error;
  }
};

const updateUser = async (id, nombre, rol, ruc, password) => {
  try {
    const item = await getUsuariosById(id);

    if (item.length === 0) {
      return null;
    }

    const [query] = await pool.execute(
      `UPDATE usuarios SET nombre_empresa = ?, id_rol = ?, ruc = ?, password = ? WHERE id = ?`,
      [nombre, rol, ruc, password, id]
    );

    return query;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};


const deleteUser = async (id) => {
  try {
    const item = await getUsuariosById(id);

    if (item.length === 0) {
      return null;
    }

    const [query] = await pool.execute(`DELETE FROM usuarios WHERE id = ?;`, [id]);
    return query;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

const deleteCarpeta = async (id) => {
  try {
    const item = await getUsuariosById(id);

    if (item.length === 0) {
      return null;
    }

    const [query] = await pool.execute(`DELETE FROM carpetas WHERE id = ?;`, [id]);
    return query;
  } catch (error) {
    console.error('Error al eliminar carpeta:', error);
    throw error;
  }
};





//falta el delete 

//https://community.listopro.com/realiza-un-crud-en-mysql-con-node-js/



module.exports = {getAllUsuarios, getAllComentarios, getAllCarpetasSede, createComentario, createCarpetaSede, detalleCarpetasSede, getAllReportesCarpeta, getUsuariosById,getAllReportes, todosCarpetas, todosReportes, createUser, updateUser, deleteUser, detalleUsuarios, getAllCarpetas, detalleCarpetas, detalleSubCarpetas,createCarpeta,deleteCarpeta}
const mysql = require('mysql2');


//require('dotenv').config();

const config = require('../config');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = config;


const pool =  mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10, // Puedes ajustar este límite según tus necesidades
    queueLimit: 0
    

    
    
});
/*

keepAlive: true,
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});*/

module.exports = pool.promise();
/*
module.exports = {
    execute: async (sql, values) => {
      try {
        const [result] = await pool.promise().execute(sql, values);
        return result;
      } catch (error) {
        console.error('Error en la consulta:', error); efwef
        throw error;
      }
    },  
  };*/
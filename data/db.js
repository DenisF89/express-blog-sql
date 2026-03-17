const mysql = require('mysql2'); 
require('dotenv').config();

const connection = mysql.createConnection({ 
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
}); 

connection.connect((err) => { 
    if (err) throw err; 
    console.log('Connected to MySQL!'); 
}); 

module.exports = connection;
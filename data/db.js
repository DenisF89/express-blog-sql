require('dotenv').config();

const dbConfiguration = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
}

//CONNESSIONE QUERY CON THEN/CATCH PROMISE (qui funziona con chiamate Index)
const mysql = require('mysql2/promise');
const dbConnection = mysql.createPool(dbConfiguration); 

//CONNESSIONE QUERY CON CALLBACK (qui funziona con le altre chiamate: Show, Destroy,Update...)
/* const mysql = require('mysql2'); 

    const dbConnection = mysql.createConnection(dbConfiguration); 
    dbConnection.connect((err) => { 
    if (err) throw err; 
    console.log('Connected to MySQL!'); 
    });  */


module.exports = dbConnection;
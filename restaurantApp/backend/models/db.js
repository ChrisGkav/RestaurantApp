const mysql = require('mysql2');

// Creating connection with Database
const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'root',            
  password: '1776548',            
  database: 'reservation_app',  
  charset: 'utf8'           
});

// Connecting to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MariaDB!' + connection.threadId);
});

module.exports = connection;

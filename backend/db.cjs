const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '32561324', // altere se houver senha
    database: 'pollastro_sistema'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Conectado ao MySQL!');
});

module.exports = connection;
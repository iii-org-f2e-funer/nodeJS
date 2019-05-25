// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'happy6'
});

// db.connect
db.connect(function(err) {
    if (err) throw err;
});

module.exports = db;
// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: '192.168.27.25',
    user: 'happy6',
    password: 'dj94xk46',
    database: 'happy6'
});

// db.connect
db.connect(function(err) {
    if (err) throw err;
});

module.exports = db;
const express = require('express');
const router = express.Router();
const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'happy6'
});
// Error handling
db.connect((error) => {
    if (error) {
        console.log('MySQL連線失敗 Error: ' + error.code)
    }
});


router.get('/', (req, res) => {
    res.send("Hello")
});
router.post('/post', (req, res) => {
    res.send(req.body)
});

router.get('/try-db', (req, res) => {
    let sql = "SELECT * FROM `product_manage`"
    db.query(sql, (error, results, fields) => {
        console.log(results)
        res.send(results);
    });

});


module.exports = router;

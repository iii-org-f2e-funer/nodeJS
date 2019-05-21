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
    let sql = "SELECT * FROM `product_manage`ORDER BY sid desc"
    db.query(sql, (error, results, fields) => {
        res.json(results);
    });

});


module.exports = router;
// SELECT product_manage.*, product_manages.`product_id` FROM product_manage left JOIN product_manages ON product_manage.`sid`= product_manage_images.`product_id` where `firmname` like '%%%s%%' ORDER BY sid desc LIMIT %s, %s"
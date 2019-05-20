const express = require('express');
const router = express.Router();
const mysql = require('mysql')

// const db = mysql.createConnection({
//     host: '192.168.27.25',
//     user: 'happy6',
//     password: 'dj94xk46',
//     database: 'happy6'
// });
// db.connect();

router.get('/', (req, res) => {
    res.json({
        str: "GET"
    });
});
router.post('/post', (req, res) => {
    res.json({
        str: "POST"
    });
});

// router.get('/try-db', (req, res)=>{
//     let sql = "SELECT * FROM `member` WHERE member_id = 1"
//     db.query(sql, (error, results, fields)=>{
//         res.json(results)
//     });
// });


module.exports = router;

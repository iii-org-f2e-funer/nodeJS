const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const db_config = require('../datebase_config.js')
const db = mysql.createConnection(db_config)

// Error handling
db.connect(error => {
  if (error) {
    console.log('MySQL連線失敗 Error: ' + error.code)
  }
  else{
    console.log('Good!! MySQL Connection successful')
  }
})


//game-type
router.get('/game_type', (req, res) => {
  let sql = "SELECT * FROM `game_type` WHERE 1"
  db.query(sql, (error, results, fields) => {
      res.json(results);
  });

});

//product-all
router.get('/productlist', (req, res) => {
    let sql = "SELECT * FROM `product_manage`ORDER BY sid desc"
    db.query(sql, (error, results, fields) => {
        res.json(results);
    });

});

//product-picture
router.get('/productlist2', (req, res) => {
    let sql = "SELECT `product_manage`.`sid`,`product_manage`.`productName`, `product_manage_images`.`image_path` FROM `product_manage` LEFT JOIN `product_manage_images` ON `product_manage`.`sid`=`product_manage_images`.`product_id`"
    db.query(sql, (error, results, fields) => {
        res.json(results);
    });

});


module.exports = router;

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const url = require('url')
const mysql = require('mysql')
const session = require('express-session')
const app = express()
const router = express.Router()


const db_config = require('../datebase_config.js')
const db = mysql.createConnection(db_config)
const cityCodeToString =require('./gameMapSql.js')
// Error handling
db.connect(error => {
    if (error) {
        console.log('MySQL連線失敗 Error: ' + error.code)
    }
    else{
        console.log('Good!! MySQL Connection successful')
    }
})



router.get('/', (req, res) => {
    let sql = "SELECT site_manage.* FROM `site_manage"
    // let sql = "SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id"
    db.query(sql, (error, results, fields) => {
    res.json(results);
    });
});



router.get('/city/:cityCode?', (req, res) => {
    let sqlCityString = cityCodeToString(req.params.cityCode)
    console.log(req.params)
    let sql = "SELECT site_manage.* FROM `site_manage` where `county`=(?)"
    // let sql = "SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `county`=(?)"
    db.query(sql,[sqlCityString],(error, results, fields) => {
    if (error) {console.log(error)}
        console.log(results)


        res.json(results);
    })
});


router.get('/img/', (req, res) => {


    let sql = "SELECT * FROM `site_image`"
    // let sql = "SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `county`=(?)"
    db.query(sql,(error, results, fields) => {
        if (error) {console.log(error)}
    res.json(results);
    })
});


router.get('/img/:sid', (req, res) => {
    if (req.params.sid){ sid = req.params.sid }
    // let sql = "SELECT * FROM `site_image` WHERE `site_id`= (?)"
    // if (req.params.sid){ sid = req.params.sid }
    let sql = "SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `site_id`=(?)"
    db.query(sql,[sid],(error, results, fields) => {
    if (error) {console.log(error)}
    console.log(results)
    let imgArray=[];
    if(results){
        results.forEach(function (image_path , index) {
            imgArray.push(results[index]['image_path'])
    })}

    // res.json(results);
      res.json({"imgArray":imgArray});
    })
});

module.exports = router




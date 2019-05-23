const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const db_config = require('../datebase_config.js')
const db = mysql.createConnection(db_config)
const multer = require('multer');
const upload = multer({dest: 'image/uploads/'})
const fs = require('fs');

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
    res.send("Hello")
});

//上傳揪團圖片
router.post('/imgupload', upload.single('pt_img'),(req,res) =>{
    console.log(req.file);

    let ext ='';
    let filename = req.file.filename;
    let path = '//localhost:3002/img/event/'

    if(req.file && req.file.originalname){
      switch(req.file.mimetype){
        case 'image/png':
          ext = '.png';
          case 'image/jpeg':
            if(!ext){
              ext = '.jpg';
            }
            fs.createReadStream(req.file.path)
            .pipe(fs.createWriteStream(__dirname + '/../public/img/event/' + filename + ext));

            res.json({
                success: true,
                file: filename + ext,
                filepath: path + filename + ext,
                name: req.body.name
            });
            return;
      }
    }
})

router.post('/newptsubmit',(req,res) =>{
  console.log(req.body)
})


module.exports = router;
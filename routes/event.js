const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const db_config = require('../datebase_config.js')
const db = mysql.createConnection(db_config)
const multer = require('multer');
const upload = multer({dest: 'image/uploads/'})
const fs = require('fs');
const util = require('util'); 

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


//新增揪團
router.post('/newptsubmit', upload.single(),(req,res) =>{

  let  sql = "INSERT INTO `party_manage`(`pt_host`, `pt_img`, `pt_member`, `pt_maxm`,`pt_time`, `pt_endtime`, `pt_city`, `pt_dist`, `pt_add`, `pt_title`, `pt_info`,`pt_level` ) VALUES (?,?,?,?,?,?,?,?,?,?,?,? )";

    db.query(sql, [req.body.pt_host, 
                    req.body.pt_img, 
                    req.body.pt_member,
                    req.body.pt_maxm,
                    req.body.pt_time,
                    req.body.pt_endtime,
                    req.body.pt_city,
                    req.body.pt_dist,
                    req.body.pt_add,
                    req.body.pt_title,
                    req.body.pt_info,
                    req.body.pt_level], (error, results, fields) => {
      if (!error) {
          res.json({ success: true })
      } else {
          res.json({ success: false })
      }
    })
});


//ptlist paginate
router.post('/ptlist',upload.none(),function (req, res) {  
  let PER_PAGE = 16;
  let offset = req.body.offset ? parseInt(req.body.offset, 10) : 0;
  let nextOffset = offset + PER_PAGE;
  let previousOffset = offset - PER_PAGE < 1 ? 0 : offset - PER_PAGE;

  let sql = 'SELECT * FROM `party_manage` WHERE `pt_state` = 1 ORDER BY `pt_sid` desc'
  db.query(sql, (error, results, fields) => {
    let items = results;    
    
    function getPaginatedItems(items, offset) {
      return items.slice(offset, offset + PER_PAGE);
    }

    let meta = {
      limit: PER_PAGE,
      next: util.format('?limit=%s&offset=%s', PER_PAGE, nextOffset),
      offset: req.query.offset,
      previous: util.format('?limit=%s&offset=%s', PER_PAGE, previousOffset),
      total_count: items.length
    };
  
    let json = {
      meta: meta,
      items: getPaginatedItems(items, offset),
    };
    return res.json(json)
     })

}
)
//讀取揪團頁面資料
router.post('/ptinfo',function (req, res) {  
  
  let ptsid=req.body.ptsid;
  let sql = 'SELECT * FROM `party_manage` WHERE `pt_sid`=(?)';

  db.query(sql, [req.body.ptsid], (error, results, fields) => {
    console.log(results)
    res.json(results)
  })
});


module.exports = router;
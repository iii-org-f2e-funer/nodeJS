const express = require('express');
const router = express.Router();
const multer = require('multer');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'happy6'
});

const storage = multer.diskStorage({
    // 資料夾
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    // 新檔名
    filename: function (req, file, cb) {
        //   cb(null, file.fieldname + '-' + Date.now())
        cb(null, Date.now() + '.' + file.originalname.split('.')[1])
    }
})
const upload = multer({ storage: storage })

router.get('/', (req, res) => {
    res.send("Hello Instagram")
});

// 新增貼文
router.post('/newStory', upload.array('photos'), (req, res) => {
    // req.body.memberID
    // req.body.content
    // photos_filename
    var photos_filename = req.files.map(item => (item.filename)).join();

    // connect to MySQL DB 
    db.connect((error) => {
        if (error) {
            console.log('MySQL連線失敗 Error: ' + error.code)
        }
    });
    // query
    var sql = "INSERT INTO `instagram_stories`(`member_id`, `content`, `photos`) VALUES (?,?,?)";
    db.query(sql, [req.body.memberID, req.body.content, photos_filename], (error, results, fields) => {
        if (!error) {
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }
    });
});

router.get('/getStories', (req, res) => {
    // connect to MySQL DB 
    db.connect((error) => {
        if (error) {
            console.log('MySQL連線失敗 Error: ' + error.code)
        }
    });
    // sql stories join member
    var sql = "SELECT `instagram_stories`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_stories` JOIN `member` WHERE  `instagram_stories`.`member_id` = `member`.`member_id`";
    db.query(sql, (error, results, fields) => {
        if (!error) {
            for (let i = 0 ; i < results.length ; i ++){
                //圖片 str 還原成陣列
                results[i].photos = results[i].photos.split(',');
            }
            // array.reverse() 最新的在前面
            res.json(results.reverse());
        }
    });
})

module.exports = router;

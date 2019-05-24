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

// 撈DB貼文
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
            for (let i = 0; i < results.length; i++) {
                //圖片 str 還原成陣列
                results[i].photos = results[i].photos.split(',');
            }
            // array.reverse() 最新的在前面
            res.json(results.reverse());
        }
    });
})

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

// 撈DB留言
router.post('/getComments', (req, res) => {
    // req.body.postID
    // connect to MySQL DB 
    db.connect((error) => {
        if (error) {
            console.log('MySQL連線失敗 Error: ' + error.code)
        }
    });
    // sql stories join member
    var sql = "SELECT `instagram_comments`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_comments` JOIN `member` WHERE `post_id`= ? AND `instagram_comments`.`member_id` = `member`.`member_id`";
    db.query(sql, req.body.postID, (error, results, fields) => {
        if (!error) {
            res.json({ success: true, data: results });
        }
    });
})

// 新增留言
router.post('/newComment', (req, res) => {
    // console.log(req.body)
    // { postID: 46, userID: 1, content: 'comment Test' }

    // connect to MySQL DB 
    db.connect((error) => {
        if (error) {
            console.log('MySQL連線失敗 Error: ' + error.code)
        }
    });
    // query
    var sql = "INSERT INTO `instagram_comments`(`post_id`, `member_id`, `content`) VALUES (?,?,?)";
    db.query(sql, [req.body.postID, req.body.userID, req.body.content], (error, results, fields) => {
        if (!error) {
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }
    });

});

// 新增留言的留言
router.post('/newSubComment', (req, res) => {
    // console.log(req.body)
    // { commentID: 9, userID: 1, content: 'test' }

    // connect to MySQL DB 
    db.connect((error) => {
        if (error) {
            console.log('MySQL連線失敗 Error: ' + error.code)
        }
    });
    // query
    var sql = "INSERT INTO `instagram_subcomments`(`comment_id`, `member_id`, `content`) VALUES (?,?,?)";
    db.query(sql, [req.body.commentID, req.body.userID, req.body.content], (error, results, fields) => {
        if (!error) {
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }
    });

});

// sql 
// 撈 貼文
// var sql = "SELECT `instagram_stories`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_stories` JOIN `member` WHERE  `instagram_stories`.`member_id` = `member`.`member_id`";
// 撈 留言
// var sql = "SELECT `instagram_comments`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_comments` JOIN `member` WHERE `instagram_comments`.`member_id` = `member`.`member_id`";
// 撈 留言的留言
//  var sql = "SELECT `instagram_subcomments`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_subcomments` JOIN `member` WHERE `instagram_subcomments`.`member_id` = `member`.`member_id`";

// get all Data
router.get('/allData', (req, res) => {
    // console.log(req.body)


    // { postID: 46, userID: 1, content: 'comment Test' }
    var data = [];
    // connect to MySQL DB 
    db.connect((error) => {
        if (error) {
            console.log('MySQL連線失敗 Error: ' + error.code)
        }
    });
    // query

    // setp 1 : GET Stories
    // var sql = "SELECT `instagram_stories`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_stories` JOIN `member` WHERE  `instagram_stories`.`member_id` = `member`.`member_id`";
    var sql = "SELECT `instagram_stories`.*,UNIX_TIMESTAMP(`instagram_stories`.`post_time`) as post_time, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_stories` JOIN `member` WHERE `instagram_stories`.`member_id` = `member`.`member_id`"
    db.query(sql, (error, results, fields) => {
        if (!error) {

            // results -> Stories
            data = results; // [{story},{story}]
            for (let i = 0; i < data.length; i++) {
                data[i].post_time = formatTime(data[i].post_time)
                data[i].photos = data[i].photos.split(',');
                data[i].comments = [];
            }
            // setp 2 : GET Comment
            // var sql = "SELECT `instagram_comments`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_comments` JOIN `member` WHERE `instagram_comments`.`member_id` = `member`.`member_id`";
            var sql = "SELECT `instagram_comments`.*,UNIX_TIMESTAMP(`instagram_comments`.`comment_time`) as comment_time, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_comments` JOIN `member` WHERE `instagram_comments`.`member_id` = `member`.`member_id`";

            db.query(sql, (error, results, fields) => {
                if (!error) {
                    // results -> Comments
                    for (let i = 0; i < results.length; i++) {
                        let index = data.findIndex(story => story.post_id === results[i].post_id);
                        if (index !== -1) {
                            results[i].subcomments = [];
                            results[i].comment_time = formatTime(results[i].comment_time)
                            data[index].comments.push(results[i])
                        }
                    }

                    // setp 3 : GET SubComments
                    var sql = "SELECT `instagram_subcomments`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_subcomments` JOIN `member` WHERE `instagram_subcomments`.`member_id` = `member`.`member_id`";
                    var sql = "SELECT `instagram_subcomments`.*,UNIX_TIMESTAMP(`instagram_subcomments`.`subcomment_time`) as subcomment_time, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_subcomments` JOIN `member` WHERE `instagram_subcomments`.`member_id` = `member`.`member_id`";

                    db.query(sql, (error, results, fields) => {
                        if (!error) {
                            // results -> SubComments
                            for (let i = 0; i < data.length; i++) {
                                for (let j = 0; j < results.length; j++) {
                                    let index = data[i].comments.findIndex(comment => comment.comment_id === results[j].comment_id);
                                    if (index !== -1) {
                                        results[j].subcomment_time = formatTime(results[j].subcomment_time)
                                        data[i].comments[index].subcomments.push(results[j])
                                    }
                                }
                            }

                            res.json(data.reverse());
                        }
                    });
                }
            });



        }
    });


});

function formatTime(timestamp) {
    const nowtime = Math.floor(+ new Date() / 1000)
    const t = nowtime - timestamp
    switch (true) {
        case t < 60:
            return '幾秒鐘前';
        case t < 60 * 60:
            return Math.floor(t / 60) + '分鐘前';
        case t < 60 * 60 * 24:
            return Math.floor(t / 60 / 60) + '小時前';
        case t < 60 * 60 * 24 * 7:
            return Math.floor(t / 60 / 60 / 24) + '天前';
        case t < 60 * 60 * 24 * 30:
            return Math.floor(t / 60 / 60 / 24 / 7) + '周前';
        case t < 60 * 60 * 24 * 365:
            return Math.floor(t / 60 / 60 / 24 / 30) + '個月前';
        default:
            return Math.floor(t / 60 / 60 / 24 / 365) + '年前';
    }

}






module.exports = router;

// SELECT * FROM `instagram_stories` LEFT JOIN `instagram_comments` on `instagram_stories`.`post_id` = `instagram_comments`.`post_id` LEFT JOIN `instagram_subcomments` on `instagram_comments`.`comment_id` =  `instagram_subcomments`.`comment_id`
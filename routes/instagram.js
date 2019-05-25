const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('./db')

// 上傳檔案設定
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
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
    // req.body => { memberID: 1, content: 'Story'}
    // req.files => [{}, {}, {}]
    // req.files[0] => { fieldname: 'photos',originalname: '',encoding: '7bit',mimetype: 'image/png',destination: 'public/images',
    //                   filename: '1558798020723.png',path: 'public\\images\\1558798020723.png',size: 2086488 }

    // photo's filename to str  =>  "1558798020723.png,1558798020724.png,1558798020725.png"
    var photos_filename = req.files.map(item => (item.filename)).join();

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

// 新增留言
router.post('/newComment', (req, res) => {
    // req.body => { postID: 46, userID: 1, content: 'comment Test' }

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
    // { commentID: 9, userID: 1, content: 'test' }

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


// SQL 撈貼文 JOIN 發文者暱稱、AVATAR
// var sql = "SELECT `instagram_stories`.*, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_stories` JOIN `member` WHERE  `instagram_stories`.`member_id` = `member`.`member_id`";

// get all Data
router.get('/allData', (req, res) => {
    // 整理全部data => json    
    // 一個陣列 > 一個個貼文 > 貼文的留言 > 留言的留言
    var data = [];

    // query
    // setp 1 : GET Stories
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
            // setp 2 : GET Comments
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
                            // 最新貼文在第一個
                            res.json(data.reverse());
                        }
                    });
                }
            });


        }
    });


});

// 轉換時間格式
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

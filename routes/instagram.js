const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../utility/db.js')

// 上傳檔案設定
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
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
            console.log(error)
            res.json({ success: false })
        }
    });
});

// 編輯貼文
router.post('/updateStory', upload.array('photos'), (req, res) => {
    // req.body => { memberID: 1, content: 'Story'}
    // req.files => [{}, {}, {}]
    // req.files[0] => { fieldname: 'photos',originalname: '',encoding: '7bit',mimetype: 'image/png',destination: 'public/images',
    //                   filename: '1558798020723.png',path: 'public\\images\\1558798020723.png',size: 2086488 }

    // photo's filename to str  =>  "1558798020723.png,1558798020724.png,1558798020725.png"
    var photos_filename = req.files.map(item => (item.filename)).join();

    // query
    if (photos_filename === '') {
        var sql = "UPDATE `instagram_stories` SET `content`=? WHERE `post_id`= ? AND `member_id`= ?";
        db.query(sql, [req.body.content, req.body.postID, req.body.memberID], (error, results, fields) => {
            if (!error) {
                res.json({ success: true })
            } else {
                console.log(error)
                res.json({ success: false })
            }
        });
    } else {
        var sql = "UPDATE `instagram_stories` SET `content`=?,`photos`=? WHERE `post_id`= ? AND `member_id`= ?";
        db.query(sql, [req.body.content, photos_filename, req.body.postID, req.body.memberID], (error, results, fields) => {
            if (!error) {
                res.json({ success: true })
            } else {
                console.log(error)
                res.json({ success: false })
            }
        });
    }

});

// 新增留言
router.post('/newComment', (req, res) => {
    // req.body => { postID: 20, userID: 1, content: 'comment Test' }

    // query
    var sql = "INSERT INTO `instagram_comments`(`post_id`, `member_id`, `content`) VALUES (?,?,?)";
    db.query(sql, [req.body.postID, req.body.userID, req.body.content], (error, results, fields) => {
        if (!error) {
            res.json({ success: true })
        } else {
            console.log(error)
            res.json({ success: false })
        }
    });

});

// 新增留言的留言
router.post('/newSubComment', (req, res) => {
    console.log(req.body)
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
// 刪除貼文
router.post('/deleteStory', (req, res) => {

    // { userID: 1, postID: 8 }

    // query
    var sql = "DELETE FROM `instagram_stories` WHERE `member_id` = ? AND `post_id` = ? ";
    db.query(sql, [req.body.userID, req.body.postID], (error, results, fields) => {
        if (!error) {
            if (results.length > 0) {
                res.json({ success: true })
            } else {
                res.json({ success: true })
            }
        } else {
            res.json({ success: false })
        }
    });
});


// [ RowDataPacket {
//     favorite_id: 1,
//     member_id: 1,
//     post_id: 1,
//     isFavorite: 1,
//     time: 2019-05-27T12:29:23.000Z } ]

// 喜歡
router.post('/changeFavorite', (req, res) => {
    // { userID: 1, postID: 2 }

    // query
    var sql = "SELECT * FROM `instagram_favorite` WHERE `member_id` = ? AND `post_id` = ?";
    db.query(sql, [req.body.userID, req.body.postID], (error, results, fields) => {
        if (!error) {

            if (results.length === 0) {
                // 第一次點 就新增
                var sql = "INSERT INTO `instagram_favorite`(`member_id`, `post_id`) VALUES (?,?)";
                db.query(sql, [req.body.userID, req.body.postID], (error, results, fields) => {
                    res.json({ success: true })
                })
            } else {
                // 有點過 就修改
                var sql = "UPDATE `instagram_favorite` SET `isFavorite`=? WHERE `favorite_id`=?";
                db.query(sql, [!results[0].isFavorite, results[0].favorite_id], (error, results, fields) => {
                    res.json({ success: true })
                })
            }

        } else {
            console.log(error)
            res.json({ success: false })
        }

    });
});

// 收藏
router.post('/changeBookmark', (req, res) => {
    // { userID: 1, postID: 2 }

    // query
    var sql = "SELECT * FROM `instagram_bookmark` WHERE `member_id` = ? AND `post_id` = ?";
    db.query(sql, [req.body.userID, req.body.postID], (error, results, fields) => {
        if (!error) {

            if (results.length === 0) {
                // 第一次點 就新增
                var sql = "INSERT INTO `instagram_bookmark`(`member_id`, `post_id`) VALUES (?,?)";
                db.query(sql, [req.body.userID, req.body.postID], (error, results, fields) => {
                    res.json({ success: true })
                })
            } else {
                // 有點過 就修改
                var sql = "UPDATE `instagram_bookmark` SET `isBookmark`=? WHERE `bookmark_id`=?";
                db.query(sql, [!results[0].isBookmark, results[0].bookmark_id], (error, results, fields) => {
                    res.json({ success: true })
                })
            }

        } else {
            console.log(error)
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
    // var sql = "SELECT `instagram_stories`.*,UNIX_TIMESTAMP(`instagram_stories`.`post_time`) as post_time, `member`.`nickname`,`member`.`photo` AS `avatar` , SUM(case when `instagram_favorite`.`isFavorite` = 1 then 1 else 0 end ) as favorites FROM `instagram_stories` JOIN `member` ON `instagram_stories`.`member_id` = `member`.`member_id` LEFT JOIN `instagram_favorite` ON `instagram_stories`.`post_id` = `instagram_favorite`.`post_id` GROUP BY `instagram_stories`.`post_id`"
    var sql = "SELECT `instagram_stories`.*,UNIX_TIMESTAMP(`instagram_stories`.`post_time`) as post_time, `member`.`nickname`,`member`.`photo` AS `avatar` , SUM(case when `instagram_favorite`.`isFavorite` = 1 then 1 else 0 end ) as favorites FROM `instagram_stories` JOIN `member` ON `instagram_stories`.`member_id` = `member`.`member_id` LEFT JOIN `instagram_favorite` ON `instagram_stories`.`post_id` = `instagram_favorite`.`post_id` GROUP BY `instagram_stories`.`post_id` UNION SELECT `instagram_stories`.*,UNIX_TIMESTAMP(`instagram_stories`.`post_time`) as post_time,  `firm_manage`.`firmname` AS `nickname`, `firm_manage`.`my_file` AS `avatar` , SUM(case when `instagram_favorite`.`isFavorite` = 1 then 1 else 0 end ) as favorites FROM `instagram_stories` JOIN `firm_manage` ON `instagram_stories`.`member_id` = CONCAT('f_',`firm_manage`.`sid`) LEFT JOIN `instagram_favorite` ON `instagram_stories`.`post_id` = `instagram_favorite`.`post_id` GROUP BY `instagram_stories`.`post_id` ORDER BY `post_id`"
    db.query(sql, (error, results, fields) => {
        if (!error) {
            // results -> Stories
            data = results; // [{story},{story}]

            for (let i = 0; i < data.length; i++) {
                (data[i].member_id[0] === 'f') ? data[i].isFirm = true : data[i].isFirm = false;
                data[i].post_time = formatTime(data[i].post_time)
                data[i].photos = data[i].photos.split(',');
                data[i].comments = [];
            }
            // setp 2 : GET Comments
            // var sql = "SELECT `instagram_comments`.*,UNIX_TIMESTAMP(`instagram_comments`.`comment_time`) as comment_time, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_comments` JOIN `member` WHERE `instagram_comments`.`member_id` = `member`.`member_id`";
            var sql = "SELECT `instagram_comments`.*,UNIX_TIMESTAMP(`instagram_comments`.`comment_time`) as comment_time, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_comments` JOIN `member` WHERE `instagram_comments`.`member_id` = `member`.`member_id`UNION SELECT `instagram_comments`.*,UNIX_TIMESTAMP(`instagram_comments`.`comment_time`) as comment_time, `firm_manage`.`firmname` AS `nickname`, `firm_manage`.`my_file` AS `avatar` FROM `instagram_comments` JOIN `firm_manage` WHERE `instagram_comments`.`member_id` = CONCAT('f_',`firm_manage`.`sid`) ORDER BY `comment_id`"
            db.query(sql, (error, results, fields) => {
                if (!error) {
                    // results -> Comments
                    for (let i = 0; i < results.length; i++) {
                        (results[i].member_id[0] === 'f') ? results[i].isFirm = true : results[i].isFirm = false;
                        let index = data.findIndex(story => story.post_id === results[i].post_id);
                        if (index !== -1) {
                            results[i].subcomments = [];
                            results[i].comment_time = formatTime(results[i].comment_time)
                            data[index].comments.push(results[i])
                        }
                    }

                    // setp 3 : GET SubComments
                    // var sql = "SELECT `instagram_subcomments`.*,UNIX_TIMESTAMP(`instagram_subcomments`.`subcomment_time`) as subcomment_time, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_subcomments` JOIN `member` WHERE `instagram_subcomments`.`member_id` = `member`.`member_id`";
                    var sql = "SELECT `instagram_subcomments`.*,UNIX_TIMESTAMP(`instagram_subcomments`.`subcomment_time`) as subcomment_time, `member`.`nickname`,`member`.`photo` AS `avatar` FROM `instagram_subcomments` JOIN `member` WHERE `instagram_subcomments`.`member_id` = `member`.`member_id` UNION SELECT `instagram_subcomments`.*,UNIX_TIMESTAMP(`instagram_subcomments`.`subcomment_time`) as subcomment_time, `firm_manage`.`firmname` AS `nickname`,`firm_manage`.`my_file` AS `avatar` FROM `instagram_subcomments` JOIN `firm_manage` WHERE `instagram_subcomments`.`member_id` =  CONCAT('f_',`firm_manage`.`sid`) ORDER BY `subcomment_id`"
                    db.query(sql, (error, results, fields) => {
                        if (!error) {
                            // results -> SubComments
                            for (let i = 0; i < results.length; i++) {
                                (results[i].member_id[0] === 'f') ? results[i].isFirm = true : results[i].isFirm = false;
                            }
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
// get Story Fav or Book
router.post('/storyState', (req, res) => {
    // { id: 1 }

    var data = [[], [], []]  // [ favorite [], bookmark [], myPost [] ]
    var sql = "SELECT * FROM `instagram_favorite` WHERE `member_id` = ? AND `isFavorite` = 1"
    db.query(sql, req.body.userId, (error, results, fields) => {
        // 有按喜歡的 丟到陣列
        for (let i = 0; i < results.length; i++) {
            data[0].push(results[i].post_id)
        }
        var sql = "SELECT * FROM `instagram_bookmark` WHERE `member_id` = ? AND `isBookmark` = 1"
        db.query(sql, req.body.userId, (error, results, fields) => {
            // 有按喜歡的 丟到陣列
            for (let i = 0; i < results.length; i++) {
                data[1].push(results[i].post_id)
            }
            var sql = "SELECT `post_id` FROM `instagram_stories` WHERE `member_id` = ?"
            db.query(sql, req.body.userId, (error, results, fields) => {
                // 
                // console.log(results)
                for (let i = 0; i < results.length; i++) {
                    data[2].push(results[i].post_id)
                }
                res.json(data);
            })
        })
    })

});

// get Story Fav or Book
router.get('/getEvents', (req, res) => {
    // { id: 1 }

    var sql = "SELECT * FROM `party_manage` WHERE `pt_sid` >= 200 AND  `pt_sid` <= 250 AND `pt_state` = 1 ORDER BY RAND() LIMIT 3"
    db.query(sql, req.body.userId, (error, results, fields) => {
        if (!error){
            res.json({success:true,data:results})
        } else {
            res.json({success:false})
        }
    })

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

const express = require('express');
const router = express.Router();
const db = require('../utility/db.js')
const moment = require('moment');

router.get('/', (req, res) => {
    res.send("Hello Home")
});

router.get('/homeEvent', (req, res) => {
    // query
    var sql = "SELECT `pt_sid`, `pt_title`, `pt_img`, `pt_time`, CONCAT(`pt_dist`,', ',`pt_add`) as `pt_add` FROM `party_manage` WHERE 1  ORDER BY `pt_sid` DESC LIMIT 10";
    db.query(sql, [req.body.userID, req.body.postID], (error, results, fields) => {
        if (!error) {
            for (let i = 0; i < results.length; i++) {
                results[i].pt_time = moment(results[i].pt_time).format("YYYY/MM/DD , hh:mm a");
                results[i].pt_time = results[i].pt_time.replace(/ am/, " 上午")
                results[i].pt_time = results[i].pt_time.replace(/ pm/, " 下午")
            }
            res.json({ success: true, data: results })
        } else {
            res.json({ success: false })
        }

    });
});

router.get('/homeProduct', (req, res) => {
    // query
    var sql = "SELECT `product_manage`.`sid`, `productName`, `price`,`product_manage_images`.`image_path` FROM `product_manage` JOIN `product_manage_images` WHERE `product_manage`.`sid` = `product_manage_images`.`product_id` GROUP BY `product_manage`.`sid`  LIMIT 10";
    db.query(sql, [req.body.userID, req.body.postID], (error, results, fields) => {
        if (!error) {
            res.json({ success: true, data: results })
        } else {
            res.json({ success: false })
        }

    });
});

router.get('/homeInstagram', (req, res) => {

    // query
    // 抓所有貼文
    var sql = "SELECT `instagram_stories`.*,UNIX_TIMESTAMP(`instagram_stories`.`post_time`) as post_time, `member`.`nickname`,`member`.`photo` AS `avatar` , SUM(case when `instagram_favorite`.`isFavorite` = 1 then 1 else 0 end ) as favorites FROM `instagram_stories` JOIN `member` ON `instagram_stories`.`member_id` = `member`.`member_id` LEFT JOIN `instagram_favorite` ON `instagram_stories`.`post_id` = `instagram_favorite`.`post_id` GROUP BY `instagram_stories`.`post_id`"
    db.query(sql, (error, results, fields) => {
        if (!error) {
            // results -> Stories
            data = results; // [{story},{story}]
            for (let i = 0; i < data.length; i++) {
                // 轉換時間
                data[i].post_time = moment(data[i].post_time).format("M月D日 ahh:mm")
                data[i].post_time = data[i].post_time.replace(/ am/, " 上午")
                data[i].post_time = data[i].post_time.replace(/ pm/, " 下午")
            }

            //抓回覆數量
            var sql = "SELECT `post_id`,COUNT(*) as comments FROM `instagram_comments` GROUP BY `post_id`"
            db.query(sql, (error, results, fields) => {
                if (!error) {
                    for (let i = 0; i < results.length; i++) {
                        let index = data.findIndex(story => story.post_id === results[i].post_id);
                        if (index !== -1) {
                            data[index].comments = results[i].comments;
                        }
                    }

                    //抓愛心數量
                    var sql = "SELECT `post_id`,COUNT(*) as favorites FROM `instagram_favorite` WHERE `isFavorite` = 1 GROUP BY `post_id`"
                    db.query(sql, (error, results, fields) => {
                        if (!error) {
                            for (let i = 0; i < results.length; i++) {
                                let index = data.findIndex(story => story.post_id === results[i].post_id);
                                if (index !== -1) {
                                    data[index].favorites = results[i].favorites;
                                }
                            }
                            res.json({ success: true, data: data })
                        } else {
                            res.json({ success: false })
                        }
                    })
                } else {
                    res.json({ success: false })
                }
            })

        } else {
            res.json({ success: false })
        }
    })
});

module.exports = router;
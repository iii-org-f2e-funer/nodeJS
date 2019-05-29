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
            for (let i = 0 ; i<results.length;i++){
                results[i].pt_time = moment(results[i].pt_time).format("YYYY/MM/DD , hh:mm a");
                results[i].pt_time = results[i].pt_time.replace( / am/," 上午")
                results[i].pt_time = results[i].pt_time.replace( / pm/," 下午")
            }
            res.json({ success: true, data: results })
        } else {
            res.json({ success: false })
        }

    });
});

router.get('/homeProduct', (req, res) => {
    // query
    var sql = "SELECT `product_manage`.`sid`, `productName`, `price`,`product_manage_images`.`image_path` FROM `product_manage` JOIN `product_manage_images` WHERE `product_manage`.`sid` = `product_manage_images`.`product_id` GROUP BY `product_manage`.`sid`";
    db.query(sql, [req.body.userID, req.body.postID], (error, results, fields) => {
        if (!error) {
            res.json({ success: true, data: results })
        } else {
            res.json({ success: false })
        }

    });
});
module.exports = router;
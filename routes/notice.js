const express = require('express');
const router = express.Router();
const db = require('../utility/db.js')
const moment = require('moment');

router.get('/', (req, res) => {
    res.send("Hello Home")
});

// 撈通知
router.get('/userNotice', function (req, res) {
    var data = [];
    if (req.session.isFirm) {
        let sql = 'SELECT *,UNIX_TIMESTAMP(`time`) as time FROM `firm_notice` WHERE firm_id = ?'
        db.query(sql, [req.session.userSid], (error, results, fields) => {
            if (!error) {
                data = results;
                for (let i = 0; i < results.length; i++) {
                    data[i].time = formatTime(data[i].time)
                }
                res.json({ success: true, notices: data.reverse() })
            } else {
                res.json({ success: false })
            }
        })
    } else {
        let sql = 'SELECT *,UNIX_TIMESTAMP(`time`) as time FROM `member_notice` WHERE member_id = ?'
        db.query(sql, [req.session.userSid], (error, results, fields) => {
            if (!error) {
                data = results;
                for (let i = 0; i < results.length; i++) {
                    data[i].time = formatTime(data[i].time)
                }
                res.json({ success: true, notices: data.reverse() })
            } else {
                res.json({ success: false })
            }
        })
    }
})

// 切換已讀
router.post('/ReadChange',(req,res)=>{
    // console.log(req.body)
    // console.log(req.session)
    var data = [];
    if (req.session.isFirm) {
        let sql = 'UPDATE `firm_notice` SET `isRead`= 1 WHERE `firm_id` = ? AND `notice_id` = ?'
        db.query(sql, [req.session.userSid,req.body.notice_id], (error, results, fields) => {
            if (!error) {
                res.json({ success: true})
            } else {
                res.json({ success: false })
            }
        })
    } else {
        let sql = 'UPDATE `member_notice` SET `isRead`= 1 WHERE `member_id` = ? AND `notice_id` = ?'
        db.query(sql,  [req.session.userSid,req.body.notice_id], (error, results, fields) => {
            if (!error) {
                res.json({ success: true})
            } else {
                res.json({ success: false })
            }
        })
    }
})

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
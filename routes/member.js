const express = require('express')
const router = express.Router()

const axios = require('axios')

const moment = require('moment')
const db = require('../utility/db.js')

//登入
router.post('/userLogin', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'SELECT * FROM `member` WHERE `account` = (?)'
  db.query(sql, [req.body.account], (error, results, fields) => {
    if (error) throw error
    if (results[0] === undefined) {
      data.message = '密碼錯誤'
      res.json({ data })
      return
    }
    if (results[0].password === req.body.password) {
      req.session.user = req.body.account
      req.session.userSid = results[0].member_id
      req.session.isFirm = false
      data.success = true
      data.member_id = results[0].member_id
      data.body = req.body
      data.message = '登入成功'
      res.json({ data })
      return
    } else {
      data.message = '帳號或密碼錯誤'
      res.json({ data })
      return
    }
  })
})

router.post('/logOut', function (req, res) {
  req.session.destroy()
  res.json('成功登出')
})


const multer = require('multer');
// 上傳檔案設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/member')
  },
  filename: function (req, file, cb) {
    //   cb(null, file.fieldname + '-' + Date.now())
    cb(null, Date.now() + '.' + file.originalname.split('.')[1])
  }
})
const upload = multer({ storage: storage })



//註冊
router.post('/userRegister', function (req, res) {
  const data = { success: false, message: '' }
  let sql = "INSERT INTO `member`(`account`, `password`, `email`, `name`, `nickname`, `gender`, `birthday`, `mobile`, `intro`, `city`, `site`, `street`, `account_status`, `photo`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

  // 預設 nickname = name
  db.query(sql, [req.body.account, req.body.password, req.body.email, req.body.name, req.body.name, "", "", "", "", "", "", "", 0, ""], (error, results, fields) => {
    if (error) throw error
    console.log(error)
    // console.log(results)
    if (results.affectedRows === 1) {
      data.success = true
      data.message = '註冊成功'
      let sql = "INSERT INTO `member_favorite`(`member_id`) VALUES (?)"
      db.query(sql, [results.insertId], (error, results, fields) => {
        if (!error) {
          res.json({ data })
        }
      })
      return
    } else {
      console.log(error)
      data.message = '註冊失敗'
      res.json({ data })
    }
  }
  )

})

//抓遊戲種類
router.get('/userPublicInfo', function (req, res) {

  var obj = { success: false, member_id: req.session.userSid, data: [], nickname: "", intro: "" }

  let sql = "SELECT * FROM `game_type` WHERE `type_id` > 0"
  db.query(sql, (error, results, fields) => {
    if (!error) {
      obj.data = results

      let sql = "SELECT  `member_favorite`.* ,`member`.`nickname`,`member`.`intro`  FROM `member_favorite` JOIN `member` WHERE  `member`.`member_id` = ? and `member_favorite`.`member_id` = ?"
      db.query(sql, [req.session.userSid, req.session.userSid], (error, results, fields) => {
        if (!error) {
          obj.success = true
          obj.nickname = results[0].nickname
          obj.intro = results[0].intro
          for (let i = 0; i < obj.data.length; i++) {
            if (results[0]["type_" + (i + 1)] === 1) {
              obj.data[i].isFav = true;
            } else {
              obj.data[i].isFav = false;
            }
          }
          res.json(obj)
        } else {
          res.json(obj)
        }
      })
    } else {
      res.json(data)
    }
  })
})
// 修改會員資料 左邊
router.post('/editUserPublicInfo', function (req, res) {
  var data = {success:false,message:""}
  let sql = "UPDATE `member` SET`nickname`=? ,`intro`= ? WHERE `member_id` = ?"
  db.query(sql, [req.body.nickname, req.body.intro, req.session.userSid], (error, results, fields) => {
    if (!error) {
      var arr = req.body.data.map(item => item.isFav === true ? true : false)
      let sql = "UPDATE `member_favorite` SET `type_1`=?,`type_2`=?,`type_3`=?,`type_4`=?,`type_5`=?,`type_6`=?,`type_7`=?,`type_8`=?,`type_9`=?,`type_10`=?,`type_11`=?,`type_12`=?,`type_13`=?,`type_14`=?,`type_15`=? WHERE `member_id` = ?"
      db.query(sql,[...arr,req.session.userSid],(error,results,fields)=>{
        if (!error) {
          data.success=true
          data.message="修改擅長遊戲成功"
          res.json(data)
        } else {
          console.log(error)
          data.message="修改擅長遊戲失敗"
          res.json(data)
        }
      })
    
    } else {
      console.log(error)
      data.message="修改暱稱失敗"
      res.json(data)
    }
  });

})


  router.post('/accountCheck', function (req, res) {
    const data = { success: false, message: '' }
    data.body = req.body
    let sql = 'SELECT * FROM `member` WHERE `account` = (?)'
    db.query(sql, [data.body.account], (error, results, fields) => {
      if (error) throw error
      if (results.length === 0) {
        data.message = '此帳號無人註冊'
        data.success = true
        res.json({ data })
        return
      } else {
        data.message = '此帳號已被註冊'
        data.success = false
        res.json({ data })
        return
      }
    })
  })

  router.post('/emailCheck', function (req, res) {
    const data = { success: false, message: '' }
    data.body = req.body
    let sql = 'SELECT * FROM `member` WHERE `account` = (?)'
    db.query(sql, [data.body.email], (error, results, fields) => {
      if (error) throw error
      if (results[0] === undefined) {
        data.message = '此email無人註冊'
        data.success = true
        res.json({ data })
        return
      } else {
        data.message = '此email已被註冊'
        data.success = false
        res.json({ data })
        return
      }
    })
  })

  //帳號設定
  router.post('/memberEdit', function (req, res) {
    const data = { success: false, message: '' }
    let sql = 'UPDATE `member` SET ? WHERE `member_id` = ?'
    db.query(
      sql,
      [
        {
          account: req.body.account,
          name: req.body.name,
          nickname: req.body.nickname,
          gender: req.body.gender,
          mobile: req.body.mobile,
          city: req.body.city,
          site: req.body.site,
          street: req.body.street,
          email: req.body.email,
          birthday: req.body.birthday,
        },
        req.body.member_id,
      ],
      (error, results, fields) => {
        if (error) throw error
        if (results.affectedRows === 1) {
          data.success = true
          data.body = req.body
          data.message = '帳號資料修改成功'
          res.json(data)
        } else {
          data.message = '修改失敗'
          res.json(data)
        }
      }
    )
  })

  //改密碼
  // req.body { member_id: 208, password: 'tttttttttt', ori_password: 'aaa' }
  router.post('/passwordEdit', function (req, res) {
    // console.log(req.body);
    const data = { success: false, message: '' }

    let sql = "SELECT  `password` FROM `member` WHERE `member_id` = ?"
    db.query(sql, [req.body.member_id], (error, results, fielsd) => {
      if (!error) {
        if (results[0].password !== req.body.ori_password) {
          console.log("原密碼輸入錯誤")
          data.message = "原密碼輸入錯誤"
          res.json(data)
        } else {
          let sql = "UPDATE `member` SET `password`= ?  WHERE `member_id` = ?"
          db.query(sql, [req.body.password, req.body.member_id], (error, results, fielsd) => {
            if (!error) {
              console.log("修改完成")
              data.success = true
              data.message = "修改完成"
              res.json(data)
            } else {
              data.success = false
              data.message = "修改失敗"
              res.json(data)
            }
          })
        }
      }
    })
    // let sql = 'UPDATE `member` SET ? WHERE `member_id` = ?'
    // db.query(
    //   sql,
    //   [
    //     {
    //       password: req.body.password,
    //     },
    //     req.body.sid,
    //   ],
    //   (error, results, fields) => {
    //     if (error) throw error
    //     if (results.affectedRows === 1) {
    //       data.success = true
    //       data.body = req.body
    //       data.message = '帳號資料修改成功'
    //       res.json(data)
    //     } else {
    //       data.message = '修改失敗'
    //       res.json(data)
    //     }
    //   }
    // )
  })

  // 訂單查詢
  router.get('/productorder', (req, res) => {
    let sql = 'SELECT * FROM `product_order` ORDER BY `order_sid` DESC'
    db.query(sql, (error, results, fields) => {
      res.json(results)
    })
  })


  // updatePhoto
  router.post('/updatePhoto', upload.single('photo'), (req, res) => {
    // console.log(req)
    // console.log(req.session)

    // query
    var sql = "UPDATE `member` SET `photo`= ? WHERE `member_id`= ?";
    db.query(sql, [req.file.filename, req.session.userSid], (error, results, fields) => {
      if (!error) {
        res.json({ success: true })
      } else {
        console.log(error)
        res.json({ success: false })
      }
    });
  })

  module.exports = router;

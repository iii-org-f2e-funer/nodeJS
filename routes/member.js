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
  console.log("FFFFFFFFFFFFFFFFFFFFUCKOU")
  const data = { success: false, message: '' }
  let sql ="INSERT INTO `member`(`account`, `password`, `email`, `name`, `nickname`, `gender`, `birthday`, `mobile`, `intro`, `city`, `site`, `street`, `account_status`, `photo`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  
  // 預設 nickname = name
  let query = db.query(sql,[req.body.account, req.body.password, req.body.email, req.body.name, req.body.name, "", "", "", "", "", "", "", 0, ""],(error, results, fields) => {
      if (error) throw error
      console.log(error)
      console.log(results)
      if (results.affectedRows === 1) {
        data.success = true
        data.message = 'YEAH'
        res.json({ data })
        return
      } else {
        data.message = '註冊失敗'
        res.json({ data })
      }
    }
  )
  console.log(query)
})


router.post('/accountCheck', function (req, res) {
  const data = { success: false, message: '' }
  data.body = req.body
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [data.body.account], (error, results, fields) => {
    if (error) throw error
    if (results[0] === undefined) {
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

router.post('/passwordEdit', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'UPDATE `member` SET ? WHERE `member_id` = ?'
  db.query(
    sql,
    [
      {
        password: req.body.password,
      },
      req.body.sid,
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

//新增
router.post('/insertAccount', function (req, res) {
  let url =
    'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    encodeURI(req.body.county + req.body.dist + req.body.address) +
    '&language=zh-TW&key=AIzaSyAf7RNhzB30wCXXposiM1SR6vGbSHkm2D4'
  let address
  const data = { success: false, message: '' }

  axios
    .get(url)
    .then(res => {
      address = res.data.results[0].geometry.location
    })
    .then(() => {
      let sql =
        'INSERT INTO `member` (member_id, account, password, email, name, nickname, birthday, mobile, intro, city, site, street, absence, participation, account_status, create_date, photo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);'
      db.query(
        sql,
        [
          null,
          req.body.member_id,
          req.body.account,
          req.body.password,
          req.body.email,
          req.body.name,
          req.body.nickname,
          req.body.birthday,
          req.body.mobile,
          req.body.intro,
          req.body.city,
          req.body.site,
          req.body.street,
          req.body.absence,
          req.body.participation,
          req.body.account_status,
          req.body.create_date,
          req.body.photo,
        ],
        (error, results, fields) => {
          if (error) throw error
          if (results.affectedRows === 1) {
            data.success = true
            data.message = '資料新增成功'
            data.body = req.body
            res.json(data)
          } else {
            data.message = '新增失敗'
            res.json(data)
          }
        }
      )
    })
})
//更新
router.post('/UserUpdateAccount', function (req, res) {
  let url =
    'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    encodeURI(req.body.county + req.body.dist + req.body.address) +
    '&language=zh-TW&key=AIzaSyAf7RNhzB30wCXXposiM1SR6vGbSHkm2D4'
  let address
  const data = { success: false, message: '' }
  let sql = 'UPDATE `member` SET ? WHERE `member_id` = ?'
  axios
    .get(url)
    .then(res => {
      address = res.data.results[0].geometry.location
    })
    .then(() => {
      db.query(
        sql,
        [
          {
            account: req.body.account,
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            nickname: req.body.nickname,
            mobile: req.body.mobile,
          },
          req.body.member_id,
        ],
        (error, results, fields) => {
          if (error) throw error
          if (results.affectedRows === 1) {
            data.success = true
            data.body = req.body
            data.message = '資料修改成功'
            res.json(data)
          } else {
            data.message = '修改失敗'
            res.json(data)
          }
        }
      )
    })
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
  db.query(sql, [req.file.filename,req.session.userSid], (error, results, fields) => {
      if (!error) {
          res.json({ success: true })
      } else {
          console.log(error)
          res.json({ success: false })
      }
  });
});

module.exports = router

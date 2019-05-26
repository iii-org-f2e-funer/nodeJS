const express = require('express')
const router = express.Router()
const db = require('./db')


router.get('/userInfo', function (req, res) {
  const data = { success: false, isFirm: false }
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [req.session.user], (error, results, fields) => {
    if (results[0] === undefined) {
      res.json(data)
    } else {
      if (req.session.isFirm) {
        data.isFirm = true
      }
      data.success = true
      data.body = results[0]
      res.json(data)
    }
  })
})

//登入
router.post('/firmLogin', function (req, res) {
  const data = { success: false, message: '' }
  data.body = req.body
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [data.body.account], (error, results, fields) => {
    if (error) throw error
    if (results[0] === undefined) {
      data.message = '帳號或密碼錯誤'
      res.json({ data })
    }
    if (results[0].password === data.body.password) {
      req.session.user = data.body.account
      req.session.userSid = results[0].sid
      req.session.isFirm = true
      data.success = true
      data.message = '登入成功'
      res.json({ data })
    } else {
      data.message = '帳號或密碼錯誤'
      res.json({ data })
    }
  })
})

router.post('/logOut', function (req, res) {
  req.session.destroy()
  res.json("成功登出")
})

//註冊
router.post('/firmRegister', function (req, res) {
  const registerTime = new Date()
  const data = { success: false, message: '' }
  data.body = req.body
  let sql = 'INSERT INTO `firm_manage`(	sid,account,password,firmname,uniform_number,cre_date) VALUES (?,?,?,?,?,?);'
  let query = db.query(sql, [null, data.body.account, data.body.password, data.body.store, data.body.uniform, registerTime], (error, results, fields) => {
    if (error) throw error
    if (results.affectedRows === 1) {
      data.success = true
      data.message = '註冊成功，請至信箱驗證帳號'
      res.json({ data })
      return
    } else {
      data.message = '註冊失敗'
      res.json({ data })
    }
  })
})

router.post('/unicodeCheck', function (req, res) {
  const data = { success: false, message: '' }
  data.body = req.body
  let sql = 'SELECT * FROM `firm_manage` WHERE `uniform_number` = (?)'
  db.query(sql, [data.body.unicode], (error, results, fields) => {
    if (error) throw error
    if (results[0] === undefined) {
      data.message = '無廠商使用'
      data.success = true
      res.json({ data })
      return
    } else {
      data.message = '此統編已有人註冊'
      data.success = false
      res.json({ data })
      return
    }
  })
})

router.post('/accountCheck', function (req, res) {
  const data = { success: false, message: '' }
  data.body = req.body
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [data.body.account], (error, results, fields) => {
    if (error) throw error
    if (results[0] === undefined) {
      data.message = '此email無人註冊'
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

//帳號設定
router.post('/firmEdit', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'UPDATE `firm_manage` SET ? WHERE `sid` = ?'
  db.query(sql, [{
    account: req.body.account,
    firmname: req.body.firmname,
    phone: req.body.phone,
    city: req.body.city,
    dist: req.body.dist,
    address: req.body.address,
    contacter: req.body.contacter,
    email: req.body.email,
  }, req.body.sid], (error, results, fields) => {
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
  })
})
router.post('/passwordEdit', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'UPDATE `firm_manage` SET ? WHERE `sid` = ?'
  db.query(sql, [{
    password: req.body.password,
  }, req.body.sid], (error, results, fields) => {
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
  })
})

//廠商資料設定
router.get('/firmInfo', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'SELECT * FROM `site_manage` WHERE `firm_id` = (?)'
  db.query(sql, [req.session.userSid], (error, results, fields) => {
    if (results[0] === undefined) {
      data.message = '此店家無場地資料'
      res.json(data)
    } else {
      data.body = results[0]
      db.query('SELECT * FROM `site_image` WHERE `site_id` = (?)', [results[0].sid], (error, img_results, fields) => {
        if (img_results[0] === undefined) {
          data.success = true
          data.message = '此店家提供場地，暫無照片'
        } else {
          data.success = true
          data.message = '獲得場地資料及照片'
          data.img = img_results
        }
        res.json(data)
      })
    }
  })
})
//新增
router.get('/insertAccount', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'INSERT INTO `site_manage` (sid,firm_id,store,county,dist,address,phone,business_hours,public_holiday,charges,about,rule,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
  db.query(sql, [null, req.body.firm_id, req.body.store, req.body.county, req.body.dist, req.body.address, req.body.phone, req.body.business_hours, req.body.public_holiday, req.body.charges, req.body.about, req.body.rule, req.body.status], (error, results, fields) => {
    if (error) throw error
    if (results.affectedRows === 1) {
      data.success = true
      data.message = '店家資料新增成功'
      data.body = req.body
      res.json(data)
    } else {
      data.message = '註冊失敗'
      res.json(data)
    }
  })
})
//更新
router.get('/updateAccount', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'UPDATE `site_manage` SET ? WHERE `sid` = ?'
  db.query(sql, [{
    sid: req.body.sid,
    firm_id: req.body.sid,
    store: req.body.store,
    county: req.body.county,
    dist: req.body.dist,
    address: req.body.address,
    phone: req.body.phone,
    business_hours: req.body.business_hours,
    public_holiday: req.body.public_holiday,
    charges: req.body.charges,
    about: req.body.about,
    rule: req.body.rule,
    status: req.body.status,
  }, req.body.sid], (error, results, fields) => {
    if (error) throw error
    if (results.affectedRows === 1) {
      data.success = true
      data.body = req.body
      data.message = '店家資料修改成功'
      res.json(data)
    } else {
      data.message = '修改失敗'
      res.json(data)
    }
  })
})


module.exports = router

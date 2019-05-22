const express = require('express')
const router = express.Router()
const mysql = require('mysql')

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'happy6',
})

var user = '';

router.get('/userInfo', function (req, res) {
  const data = { success: false }
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [user], (error, results, fields) => {
    if (results[0] === undefined) {
      res.json(data)
    } else {
      data.success = true
      data.body = results[0]
      res.json(data)
    }
  })
})


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
      user = data.body.account
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
  user = ''
  res.json("成功登出")
})

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


module.exports = router

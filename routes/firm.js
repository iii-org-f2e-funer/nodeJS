const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const db_config = require('../datebase_config.js')
const db = mysql.createConnection(db_config)

router.get('/userInfo', function(req, res) {
  console.log(req.session)
  const data = { success: false }
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [req.session.user], (error, results, fields) => {
    if (results[0] === undefined) {
      res.json(data)
    } else {
      data.success = true
      data.body = results[0]
      res.json(data)
    }
  })
})

router.post('/firmLogin', function(req, res) {
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
      console.log(req.session)
      data.success = true
      data.message = '登入成功'
      res.json({ data })
    } else {
      data.message = '帳號或密碼錯誤'
      res.json({ data })
    }
  })
})

router.post('/logOut', function(req, res) {
  req.session.destroy()
  res.json('成功登出')
})

router.post('/firmRegister', function(req, res) {
  const registerTime = new Date()
  const data = { success: false, message: '' }
  console.log(req.body)
  let sql =
    'INSERT INTO `firm_manage`(	sid,account,password,firmname,uniform_number,cre_date) VALUES (?,?,?,?,?,?);'
  let query = db.query(
    sql,
    [
      null,
      req.body.account,
      req.body.password,
      req.body.store,
      req.body.uniform,
      registerTime,
    ],
    (error, results, fields) => {
      if (error) throw error
      if (results.affectedRows === 1) {
        data.success = true
        data.message = '註冊成功，請至信箱驗證帳號'
        data.body = req.body
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

router.post('/unicodeCheck', function(req, res) {
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

router.post('/accountCheck', function(req, res) {
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

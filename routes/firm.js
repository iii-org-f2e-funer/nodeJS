const express = require('express')
const router = express.Router()
const mysql = require('mysql')

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'happy6',
})
// Error handling
db.connect(error => {
  if (error) {
    console.log('MySQL連線失敗 Error: ' + error.code)
  }
})

var user
router.get('/UserInfo', function(req, res) {
  console.log(user)
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [user], (error, results, fields) => {
    if (results[0] === undefined) {
      res.send('no data')
      return
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
      return
    }
    if (results[0].password === data.body.password) {
      user = req.session.user = data.body.account
      data.success = true
      data.message = '登入成功'
      data.user = results[0].contacter
      res.json({ data })
      return
    } else {
      data.message = '帳號或密碼錯誤'
      res.json({ data })
      return
    }
  })
})

module.exports = router

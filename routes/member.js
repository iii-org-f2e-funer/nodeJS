const express = require('express')
const router = express.Router()
const db = require('../utility/db.js')

router.get('/userInfo', function (req, res) {
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [req.session.user], (error, results, fields) => {
    if (results[0] === undefined) {
      res.json(data)
    }
  })
})

module.exports = router

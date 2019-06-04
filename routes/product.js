const express = require('express')
const router = express.Router()
const db = require('../utility/db.js')

//game-type
router.get('/game_type', (req, res) => {
  let sql = 'SELECT * FROM `game_type` WHERE 1'
  db.query(sql, (error, results, fields) => {
    res.json(results)
  })
})
//product_del
router.post('/product_del', function(req, res) {
  console.log(req.body.sid)
  const data = { success: false, message: '' }
  let sql = 'DELETE FROM `product_manage` WHERE `sid` = (?)'
  db.query(sql, [req.body.sid], (error, results, fields) => {
    if (error) throw error
    if (results[0] === undefined) {
      data.message = '沒有此資料'
      res.json(data)
    } else {
      data.success = true
      data.message = '已刪除'
      res.json(data)
    }
  })
})
//product_manage
router.get('/product_manage', (req, res) => {
  console.log(req.session.userSid)
  let sql = 'SELECT * FROM `product_manage` WHERE `seller_sid` = (?)'
  db.query(sql, [req.session.userSid], (error, results, fields) => {
    res.json(results)
  })
})
//product-all
router.get('/productlist', (req, res) => {
  let sql = 'SELECT * FROM `product_manage`ORDER BY sid desc'
  db.query(sql, (error, results, fields) => {
    res.json(results)
  })
})

//product-picture
router.get('/productlist2', (req, res) => {
  let sql =
    'SELECT `product_manage`.`sid`,`product_manage`.`productName`, `product_manage_images`.`image_path` FROM `product_manage` LEFT JOIN `product_manage_images` ON `product_manage`.`sid`=`product_manage_images`.`product_id`'
  db.query(sql, (error, results, fields) => {
    res.json(results)
  })
})

//product_order

router.post('/product_order', function(req, res) {
  const data = { success: false, message: '' }
  // console.log(req.body)
  let sql =
    'INSERT INTO `product_order`(`order_sid`, `login_user_sid`, `paymethod`, `getmethod`, `Freight`, `totalprice`, `geter_name`, `geter_addr`, `geter_city`, `geter_dist`, `geter_email`, `geter_phone`, `order_name`, `order_city`, `order_dist`, `order_addr`, `order_email`, `order_phone`, `paid`, `cre_date`, `allcart`,`seller`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  db.query(
    sql,
    [
      null,
      req.body.login_user_sid,
      req.body.paymethod,
      req.body.getmethod,
      req.body.Freight,
      req.body.totalprice,
      req.body.geter_name,
      req.body.geter_addr,
      req.body.geter_city,
      req.body.geter_dist,
      req.body.geter_email,
      req.body.geter_phone,
      req.body.order_name,
      req.body.order_city,
      req.body.order_dist,
      req.body.order_addr,
      req.body.order_email,
      req.body.order_phone,
      req.body.paid,
      new Date(),
      req.body.choose_order,
      req.body.seller,
    ],
    (error, results, fields) => {
      if (error) throw error
      if (results.affectedRows === 1) {
        data.success = true
        data.message = 'order新增成功'
        data.body = req.body
        // res.json(data)
        const member_id = req.body.login_user_sid //收信人 會員 membet_id
        const content = '您成功購買一件商品,可至訂單管理頁面查看訂單資訊' //內文
        const link = '/member/UserShopping' //通知點下去要連到哪
        const img = '' //圖片網址
        // query
        var sql =
          'INSERT INTO `member_notice`(`member_id`, `content`, `link`, `img`) VALUES (?,?,?,?)'
        db.query(
          sql,
          [member_id, content, link, img],
          (error, results, fields) => {
            if (!error) {
              data.message = 'order新增成功 notice is send'
              res.json(data)
            } else {
              data.message = 'order新增成功 notice is not send'
              res.json(data)
            }
          }
        )
      } else {
        data.message = '新增失敗'
        res.json(data)
      }
    }
  )
})

router.get('/firm', (req, res) => {
  let sql = 'SELECT `sid`,`firmname` FROM `firm_manage` WHERE 1'
  db.query(sql, (error, results, fields) => {
    res.json(results)
  })
})

router.get('/firm_order', (req, res) => {
  let sql = 'SELECT * FROM `product_order` WHERE `seller` = ?'
  db.query(sql, [req.session.userSid], (error, results, fields) => {
    res.json(results)
  })
})
module.exports = router

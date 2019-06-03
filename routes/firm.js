const express = require('express')
const router = express.Router()
const db = require('../utility/db.js')
const axios = require('axios')
const nodemailer = require('nodemailer')
const moment = require('moment')
const uuidv1 = require('uuid/v1')
const multer = require('multer')

// 上傳檔案設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/firm')
  },
  filename: function (req, file, cb) {
    //   cb(null, file.fieldname + '-' + Date.now())
    cb(null, Date.now() + '.' + file.originalname.split('.')[1])
  },
})
const upload = multer({ storage: storage })

router.get('/userInfo', function (req, res) {
  const data = { success: false, isFirm: req.session.isFirm }
  if (req.session.isFirm) {
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
  } else {
    let sql2 = 'SELECT * FROM `member` WHERE `account` = (?)'
    db.query(sql2, [req.session.user], (error2, results2, fields2) => {
      if (results2[0] === undefined) {
        res.json(data)
      } else {
        data.success = true
        data.body = results2[0]
        // date轉換
        if (data.body.birthday === '0000-00-00') {
          data.body.birthday = ''
        } else {
          data.body.birthday = moment(data.body.birthday).format('YYYY-MM-DD')
        }

        // console.log(moment(data.body.birthday))
        // console.log(moment(data.body.birthday, ['YYYY-MM-DD']))
        res.json(data)
      }
    })
  }
})

//登入
router.post('/firmLogin', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'SELECT * FROM `firm_manage` WHERE `account` = (?)'
  db.query(sql, [req.body.account], (error, results, fields) => {
    if (error) throw error
    if (results[0] === undefined) {
      data.message = '帳號或密碼錯誤'
      res.json({ data })
      return
    }
    if (results[0].password === req.body.password) {
      if (!results[0].islive) {
        data.message = '此帳號未被激活'
        res.json({ data })
        return
      }
      req.session.user = req.body.account
      req.session.userSid = results[0].sid
      req.session.isFirm = true
      data.success = true
      data.message = '登入成功'
      data.body = results[0].sid
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

//註冊
router.post('/firmRegister', function (req, res) {
  const registerTime = new Date()
  const data = { success: false, message: '' }
  const code = uuidv1()
  let sql =
    'INSERT INTO `firm_manage`(	sid,account,password,email,uniform_number,cre_date,code,islive) VALUES (?,?,?,?,?,?,?,?);'
  let query = db.query(
    sql,
    [
      null,
      req.body.account,
      req.body.password,
      req.body.email,
      req.body.unicode,
      registerTime,
      code,
      false,
    ],
    (error, results, fields) => {
      if (error) throw error
      if (results.affectedRows === 1) {
        data.success = true
        data.message = '註冊成功，請至信箱驗證帳號'
        data.body = req.body
        var transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'gogofunner@gmail.com',
            pass: 'qaz741WSX852',
          },
          tls: {
            rejectUnauthorized: false,
          },
        })
        //   {
        //     code: String (uuid),  //激活码，格式自己定义
        //     date: Number, //过期日期，过期后不能激活
        //     islive: Boolean //判断是否激活
        //    }
        var options = {
          //寄件者
          from: 'gogofunner@gmail.com',
          //收件者
          to: req.body.email,
          //主旨
          subject: '歡迎使用funner',
          html:
            '<h2 style="font-weight: 400">您好</h2><h2 style="font-weight: 400">感謝您在FUNer上註冊帳號，請點擊連結啟用帳號，謝謝</h2 style="font-weight: 400"><a href="http://localhost:3000/checkCode?code=' +
            code +
            '">http://localhost:3000/checkCode?code=' +
            code +
            '<a/><h2 style="font-weight: 400">此郵件為FUNer平台所發送，若您未在FUNer註冊帳號，請忽略此郵件</h2><h2 style="font-weight: 400">FUNer團隊 敬上</h2>',
        }
        transporter.sendMail(options, function (error, info) {
          if (error) {
            console.log('EEEEEEEEEEEE', error)
          } else {
            console.log('訊息發送: ' + info.response)
          }
        })
        res.json({ data })
        return
      } else {
        data.message = '註冊失敗'
        res.json({ data })
      }
    }
  )
})
//checkCode
router.post('/checkCode', function (req, res) {
  console.log('req.body.code:', req.body.code)
  const data = { success: false, message: '' }
  let sql = 'SELECT * FROM `firm_manage` WHERE `code` = (?)'
  db.query(sql, [req.body.code], (error, results, fields) => {
    if (error) throw error
    if (results[0] === undefined) {
      data.message = '找不到code，激活失敗'
      res.json(data)
      return
    } else {
      console.log('results[0].sid:', results[0].sid)
      let sql2 = 'UPDATE `firm_manage` SET ? WHERE `sid` = ?'
      db.query(
        sql2,
        [
          {
            islive: true,
          },
          results[0].sid,
        ],
        (error2, results2, fields2) => {
          if (error2) throw error2
          if (results2.affectedRows === 1) {
            data.success = true
            data.message = '激活成功'
            data.body = results[0]
          } else {
            data.message = 'islive=false激活失敗'
          }
          res.json(data)
          return
        }
      )
    }
  })
})
// login code info
router.post('/codeInfo', upload.array('files'), function (req, res) {
  const data = { success: false, message: '' }
  if (!req.files.length) {
    let sql = 'UPDATE `firm_manage` SET ? WHERE `sid` = ?'
    db.query(
      sql,
      [
        {
          firmname: req.body.firmname,
          phone: req.body.phone,
          city: req.body.city,
          dist: req.body.dist,
          address: req.body.address,
          contacter: req.body.contacter,
          my_file: req.files[0].filename,
        },
        req.body.sid,
      ],
      (error, results, fields) => {
        if (error) throw error
        if (results.affectedRows === 1) {
          data.success = true
          data.message = '基本資料完成'
          res.json(data)
          return
        } else {
          data.message = '基本資料新增失敗'
          res.json(data)
          return
        }
      }
    )
  } else {
    let sql = 'UPDATE `firm_manage` SET ? WHERE `sid` = ?'
    db.query(
      sql,
      [
        {
          firmname: req.body.firmname,
          phone: req.body.phone,
          city: req.body.city,
          dist: req.body.dist,
          address: req.body.address,
          contacter: req.body.contacter,
        },
        req.body.sid,
      ],
      (error, results, fields) => {
        if (error) throw error
        if (results.affectedRows === 1) {
          data.success = true
          data.message = '基本資料完成'
          res.json(data)
          return
        } else {
          data.message = '基本資料新增失敗'
          res.json(data)
          return
        }
      }
    )
  }

})

// register check
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
  let sql = 'SELECT * FROM `firm_manage` WHERE `email` = (?)'
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
router.post('/firmEdit', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'UPDATE `firm_manage` SET ? WHERE `sid` = ?'
  db.query(
    sql,
    [
      {
        account: req.body.account,
        firmname: req.body.firmname,
        phone: req.body.phone,
        city: req.body.city,
        dist: req.body.dist,
        address: req.body.address,
        contacter: req.body.contacter,
        email: req.body.email,
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
router.post('/passwordEdit', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'SELECT * FROM `firm_manage` WHERE `sid` = (?)'
  db.query(sql, [req.body.sid], (error, results, fields) => {
    if (error) throw error
    if (results[0].password === req.body.ori_password) {
      let sql2 = 'UPDATE `firm_manage` SET ? WHERE `sid` = ?'
      db.query(
        sql2,
        [
          {
            password: req.body.password,
          },
          req.body.sid,
        ],
        (error2, results2, fields2) => {
          if (error2) throw error2
          if (results2.affectedRows === 1) {
            data.message = '密碼修改成功'
          } else {
            data.message = '密碼修改失敗'
          }
        }
      )
      data.success = true
      res.json(data)
    } else {
      data.message = '原密碼不符'
      res.json(data)
    }
  })
})

//場地資料設定
router.get('/firmInfo', function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'SELECT * FROM `site_manage` WHERE `firm_id` = (?)'
  db.query(sql, [req.session.userSid], (error, results, fields) => {
    if (results[0] === undefined) {
      data.message = '此店家無場地資料'
      data.firm_id = req.session.userSid
      data.success = true
      res.json(data)
    } else {
      data.body = results[0]
      db.query(
        'SELECT * FROM `site_image` WHERE `site_id` = (?)',
        [results[0].sid],
        (error2, img_results, fields2) => {
          if (error2) throw error2
          if (img_results[0] === undefined) {
            data.success = true
            data.firm_id = req.session.userSid
            data.message = '此店家提供場地，暫無照片'
            res.json(data)
          } else {
            data.firm_id = req.session.userSid
            data.message = '獲得場地資料及照片'
            data.success = true
            data.img = img_results
            res.json(data)
          }
        }
      )
    }
  })
})
//廠商logo更新
router.post('/avatarUpdate', upload.array('file'), function (req, res) {
  const data = { success: false, message: '' }
  let sql = 'UPDATE `firm_manage` SET ? WHERE `sid` = ?'
  db.query(
    sql,
    [{ my_file: req.files[0].filename }, req.body.firm_id],
    (error, results, fields) => {
      if (error) throw error
      if (results.affectedRows === 1) {
        data.success = true
        data.body = req.body
        data.message = 'logo修改成功'
        res.json(data)
      } else {
        data.message = '修改失敗'
        res.json(data)
      }
    }
  )
})

//新增
router.post('/insertAccount', upload.array('files'), function (req, res) {
  const data = { success: false, message: '' }

  //地址轉換經緯度
  let url =
    'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    encodeURI(req.body.county + req.body.dist + req.body.address) +
    '&language=zh-TW&key=AIzaSyAf7RNhzB30wCXXposiM1SR6vGbSHkm2D4'
  let address
  axios
    .get(url)
    .then(res => {
      address = res.data.results[0].geometry.location
      console.log(address)
    })
    .then(() => {
      let sql =
        'INSERT INTO `site_manage` (sid,firm_id,store,county,dist,address,lat,lng,phone,business_hours,public_holiday,charges,about,rule,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);'

      db.query(
        sql,
        [
          null,
          req.body.firm_id,
          req.body.store,
          req.body.county,
          req.body.dist,
          req.body.address,
          address.lat,
          address.lng,
          req.body.phone,
          req.body.business_hours,
          req.body.public_holiday,
          req.body.charges,
          req.body.about,
          req.body.rule,
          req.body.status,
        ],
        (error, results, fields) => {
          if (error) throw error
          if (results.affectedRows === 1) {
            data.success = true
            data.body = req.body
            let sql_img =
              'INSERT INTO `site_image` ( img_sid,site_id,image_path ) VALUES (?,?,?)'
            for (let i = 0; i < req.files.length; i++) {
              db.query(
                sql_img,
                [null, results.insertId, req.files[i].filename],
                (error2, results2, fields2) => {
                  if (error2) throw error2
                  if (results2.affectedRows === 1) {
                    data.message = '場地照片新增成功'
                  } else {
                    data.message = '場地照片新增失敗'
                  }
                }
              )
            }
          } else {
            data.message = '場地新增失敗'
          }
        }
      )
      res.json(data)
      return
    })
    .catch(error => {
      console.log(error)
    })
})
//更新
router.post('/updateAccount', upload.array('files'), function (req, res) {
  const data = { success: false, message: '' }

  //地址轉換經緯度
  let url =
    'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    encodeURI(req.body.county + req.body.dist + req.body.address) +
    '&language=zh-TW&key=AIzaSyAf7RNhzB30wCXXposiM1SR6vGbSHkm2D4'
  let address
  let sql = 'UPDATE `site_manage` SET ? WHERE `sid` = ?'
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
            store: req.body.store,
            county: req.body.county,
            dist: req.body.dist,
            address: req.body.address,
            lat: address.lat,
            lng: address.lng,
            phone: req.body.phone,
            business_hours: req.body.business_hours,
            public_holiday: req.body.public_holiday,
            charges: req.body.charges,
            about: req.body.about,
            rule: req.body.rule,
            status: req.body.status,
          },
          req.body.sid,
        ],
        (error, results, fields) => {
          if (error) throw error
          if (results.affectedRows === 1) {
            data.success = true
            data.body = req.body
            let sql_img =
              'INSERT INTO `site_image` (img_sid,site_id,image_path) VALUES (?,?,?)'
            for (let i = 0; i < req.files.length; i++) {
              db.query(
                sql_img,
                [null, req.body.sid, req.files[i].filename],
                (error2, results2, fields2) => {
                  if (error2) throw error2
                  if (results2.affectedRows === 1) {
                    data.success = true
                    data.message = '資料修改成功、場地照片新增成功'
                  } else {
                    data.success = true
                    data.message = '資料修改成功、場地照片新增失敗'
                  }
                }
              )
            }
          } else {
            data.message = '修改失敗'
          }
        }
      )
      res.json(data)
      return
    })
    .catch(error => {
      console.log(error)
    })
})
const storage_product = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/product')
  },
  filename: function (req, file, cb) {
    //   cb(null, file.fieldname + '-' + Date.now())
    cb(null, Date.now() + '.' + file.originalname.split('.')[1])
  },
})
const upload_product = multer({ storage: storage_product })
// 商品上架
router.post('/insertProduct', upload_product.array('files'), function (
  req,
  res
) {
  const data = { success: false, message: '' }
  let sql =
    'INSERT INTO `product_manage` (sid,productName,seller_sid,price,description,sellStatus,createDate,gametype_id) VALUES (?,?,?,?,?,?,?,?)'
  db.query(
    sql,
    [
      null,
      req.body.productName,
      req.body.seller_id,
      req.body.price,
      req.body.description,
      0,
      new Date(),
      req.body.gametype_id,
    ],
    (error, results, fields2) => {
      if (error) throw error
      if (results.affectedRows === 1) {
        let sql_img =
          'INSERT INTO `product_manage_images` (sid,	product_id,image_path) VALUES (?,?,?)'
        for (let i = 0; i < req.files.length; i++) {
          db.query(
            sql_img,
            [null, results.insertId, req.files[i].filename],
            (error2, results2, fields2) => {
              if (error2) {
                throw error2
              }
              if (results2.affectedRows === 1) {
                data.success = true
                data.message = '商品新增成功、照片新增成功'
              } else {
                data.success = true
                data.message = '商品新增成功、照片新增失敗'
              }
            }
          )
        }
      }
      res.json(data)
      return
    }
  )
})
module.exports = router

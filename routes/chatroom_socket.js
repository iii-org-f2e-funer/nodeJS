var express = require('express')
// var app = express();
const router = express.Router()
const mysql = require('mysql')
const bluebird = require('bluebird')
const moment = require('moment')
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)

//連線資料庫
const db = require('../utility/db.js')
//連接socket io
server.listen(8080, () => {
  console.log(new Date() + 'Socket.io Successfully connect to port 8080')
})

//socket io 後台資料處理
io.on('connection', function(socket) {
  let id = socket.id
  console.log('socketID', id)
  socket.on('join', data => {
    console.log(data)
    socket.join(`${data}`)
    socket.emit('join', `chat in room` + data)
  })
  socket.on("message",(obj)=>{
   
    console.log(`${obj.roomID}`)
    console.log("chat data:",obj)
    io.to(`${obj.roomID}`).emit('message', obj)
  })
 
})

//連線資料庫
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'PHLEE', //root  PHLEE
//   password: 'au4a83', //""  au4a83
//   database: 'happy6', //happy6  chatroom
// })
// db.connect(function(err) {
//   if (err) {
//     console.log('error connecting: ' + err.stack)
//     return
//   }
//   console.log('連線成功--connected as id ' + db.threadId)
// })
bluebird.promisifyAll(db)

//去後台要聊天資料

router.get('/message/:user_id', (req, res) => {
  console.log('req id:', req.params.user_id)
  db.queryAsync({
    sql: `SELECT h.*,x.name x_fromname,y.name y_toname FROM (SELECT * FROM chat_header WHERE from_id=${
      req.params.user_id
    } OR to_id=${
      req.params.user_id
    }) as h JOIN  member x ON(h.from_id=x.member_id) JOIN member y ON (h.to_id=y.member_id) ORDER BY h.time DESC `,

    //{h_id: ,h_sub: ,m_id: ,m_sender: ,m_cont: ,m_time: }

    timeout: 40000, // 40s
    //values: ['David']
  }).then(data => {
    data.map((ele, index, arr) => {
      arr[index].time = moment(ele.time).format('YYYY-MM-DD, HH:mm:ss')
      arr[index].create_time = moment(ele.create_time).format(
        'YYYY-MM-DD, HH:mm:ss'
      )
    })
    console.log(data)
    res.json(data)
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
  })
})

router.get('/message/:user_id/:to_id', (req, res) => {
  console.log('req id:', req.params.user_id)
  console.log('to id:', req.params.to_id)
  db.queryAsync({
    sql: `SELECT h.id h_id,h.create_time h_stime, m.id m_id, m.content m_cont, m.is_sender m_issender, m.time m_time,IF(m.is_sender, x.name,y.name) as sender, IF(!m.is_sender, x.name,y.name) as receiver,IF(m.is_sender, x.member_id,y.member_id) as sender_id, IF(!m.is_sender, x.member_id,y.member_id) as receiver_id  FROM(SELECT * FROM chat_header WHERE from_id=${
      req.params.user_id
    } OR to_id=${
      req.params.user_id
    } ) as h JOIN chat_message as m ON(h.id=m.header_id) JOIN member x ON(h.from_id=x.member_id) JOIN member y ON (h.to_id=y.member_id) ORDER BY m.time DESC`,

    //{h_id: ,h_sub: ,m_id: ,m_sender: ,m_cont: ,m_time: }

    timeout: 40000, // 40s
    //values: ['David']
  }).then(data => {
    data.map((ele, index, arr) => {
      arr[index].m_time = moment(ele.m_time).format('YYYY-MM-DD, HH:mm:ss')
      arr[index].h_stime = moment(ele.h_stime).format('YYYY-MM-DD, HH:mm:ss')
    })
    console.log(data)
    res.json(data)
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
  })
})

router.post('/message/:user_id/:to_id', (req, res) => {
  console.log('req id:', req.params.user_id)
  let bodyData = req.body
  // console.log(req.body)
  // console.log(bodyData)

  let data = { success: false }

  //insert
  db.queryAsync('INSERT INTO `chat_message` SET ? ', {
    header_id: bodyData.h_id,
    is_sender: bodyData.m_issender,
    content: bodyData.m_cont,
    is_readed: bodyData.is_readed,
    time: bodyData.m_time,
  }).then(result => {
    if (result.affectedRows === 1) {
      console.log('insert data success')
      //UPDATE
      db.queryAsync(
        'UPDATE chat_header SET subject = ?, time = ? WHERE id = ?',
        [bodyData.m_cont, bodyData.m_time, bodyData.h_id]
      ).then(result => {
        if (result.changedRows >= 1) {
          console.log('UPDATE SUCCESS')
        }
      })
    }
  })
})

module.exports = router

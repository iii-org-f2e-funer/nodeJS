var express = require('express')
// var app = express();
const router = express.Router()
const mysql = require('mysql')
const bluebird = require('bluebird')
const moment = require('moment')
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
const db = require('../utility/db.js')

//連接socket io
server.listen(8080, () => {
  console.log(new Date() + 'Socket.io Successfully connect to port 8080')
})

//socket io 後台資料處理
io.on('connection', function(socket) {
  let id = socket.id
  console.log('socketID', id)
  socket.on('confirm', obj => {
    console.log(obj)
    io.emit('confirm', obj)
  })
  socket.on('join', data => {
    console.log(data)
    socket.join(`${data}`)
    socket.emit('join', `chat in room` + data)
  })
  socket.on('message', obj => {
    console.log(`${obj.roomID}`)
    console.log('chat data:', obj)
    io.to(`${obj.roomID}`).emit('message', obj)
    io.emit('all_message', obj)
  })
  socket.on('disconnect', () => {
    console.log('disconnect!!!!')
  })
})

//連線資料庫
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root', //root  PHLEE
//   password: '', //""  au4a83
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
    sql: `SELECT h.*,x.nickname x_fromname,y.nickname y_toname, x.photo photoFROM_URL, y.photo photoTO_URL FROM (SELECT * FROM chat_header WHERE from_id=${
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
    // console.log(data)
    res.json(data)
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
  })
})

//公開會員頁面
router.get('/openMemberPage/:to_id', (req, res) => {
  console.log('req id:', req.params.to_id)
  var OMPdata = []
  db.queryAsync({
    sql: `SELECT m.nickname nickname, m.birthday birthday, m.gender gender, m.city location, m.intro about, m.photo photoURL, COUNT(friend_list.status) AS friendTotal FROM (SELECT * FROM member WHERE member_id=${
      req.params.to_id
    } ) as m JOIN friend_list ON((friend_list.user_id=${
      req.params.to_id
    } || friend_list.friend_id=${
      req.params.to_id
    })&&friend_list.status="approve")`,
    timeout: 40000, // 40s
  }).then(data => {
    let birthYear = parseInt(moment(data[0].birthday).format('YYYY'))
    let nowYear = parseInt(new Date().getFullYear())
    data[0].birthday = nowYear - birthYear + 1
    console.log(data[0])
    OMPdata = [data[0], ...OMPdata]
    db.queryAsync({
      sql: `SELECT * FROM member_favorite WHERE member_id=${req.params.to_id} `,
      timeout: 40000, // 40s
    }).then(game => {
      OMPdata = [game[0], ...OMPdata]
      console.log(game[0])
      console.log('OMP', OMPdata)
   
      //pt_num
      db.queryAsync({
        sql: `SELECT COUNT(p.pt_applystatus) as pt_conut FROM (SELECT * FROM member WHERE member_id=${req.params.to_id}) as m JOIN party_apply as p ON((p.pt_applymember=m.account||p.pt_host=m.account) && p.pt_applystatus="approve") `,
        timeout: 40000, // 40s
      }).then(pt_num => {
        OMPdata = [ ...OMPdata, pt_num[0]]
        console.log(pt_num[0])
        console.log('OMP', OMPdata)
        res.json(OMPdata)
        
      })
    })
  })
})

router.get('/message/:user_id/:to_id', (req, res) => {
  console.log('req id:', req.params.user_id)
  console.log('to id:', req.params.to_id)
  db.queryAsync({
    sql: `SELECT h.id h_id,h.create_time h_stime, m.id m_id, m.content m_cont, m.sender_id m_sender_id,m.receiver_id m_receiver_id, m.time m_time, x.nickname x_name, x.photo photoFROM_URL FROM(SELECT * FROM chat_header WHERE from_id=${
      req.params.user_id
    } OR to_id=${
      req.params.user_id
    } ) as h JOIN chat_message as m ON(h.id=m.header_id) JOIN member x ON(m.sender_id=x.member_id)  ORDER BY m.time DESC`,

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

//要朋友資料

// SELECT f.*, x.name user_name,y.name friend_name FROM(SELECT * FROM friend_list where user_id=2 OR friend_id=2) as f JOIN member x ON(f.user_id=x.member_id) JOIN member y ON (f.friend_id=y.member_id)
router.get('/friendList/:user_id', (req, res) => {
  let reqID = req.params.user_id
  console.log('req id:', reqID)
  db.queryAsync({
    sql: `SELECT f.*, x.nickname user_name,y.nickname friend_name, x.photo photoFROM_URL, y.photo photoTO_URL FROM(SELECT * FROM friend_list where user_id=${reqID} OR friend_id=${reqID}) as f JOIN member x ON(f.user_id=x.member_id) JOIN member y ON (f.friend_id=y.member_id) `,
    timeout: 40000, // 40s
  }).then(data => {
    let friendData = []
    console.log('allFriend:', data)
    data.map((ele, index, arr) => {
      let friendList = {}
      if (ele.user_id == reqID) {
        friendList.friendID = ele.friend_id
        friendList.friendName = ele.friend_name
        friendList.status = ele.status
      } else if (ele.friend_id == reqID) {
        friendList.friendID = ele.user_id
        friendList.friendName = ele.user_name
        friendList.status = ele.status
      }
      friendData = [friendList, ...friendData]
    })
    console.log('FriendData:', friendData)
    res.json([data, friendData])
  })
})
//POST FriendList
router.post('/friendList/:to_id', (req, res) => {
  var user_id = req.body.applicant
  var toID = req.params.to_id
  //內文
  const link = '/chatroom/openMemberPage/ID' + user_id //通知點下去要連到哪
  const img = 'http://localhost:3002/public/images/event/002.jpg' //圖片網址

  db.queryAsync(`SELECT nickname FROM member WHERE member_id=${user_id}`).then(
    data => {
      var content = `您收到${data[0].nickname}的交友邀請`
      db.queryAsync({
        sql: `SELECT * FROM friend_list WHERE (user_id=${user_id} OR user_id=${toID}) && (friend_id=${toID} OR friend_id=${user_id}) `,
        timeout: 40000, // 40s
      }).then(data => {
        if (!data[0]) {
          db.queryAsync('INSERT INTO `friend_list` SET ? ', {
            user_id: user_id,
            friend_id: toID,
            status: 'review',
          }).then(result => {
            if (result.affectedRows === 1) {
              console.log('insert data success')

              //--------------給一般會員的通知----------------------------------------------
              // query
              var noticeSql =
                'INSERT INTO `member_notice`(`member_id`,`send_id`, `content`, `link`, `img`) VALUES (?,?,?,?,?)'
              db.query(
                noticeSql,
                [toID, user_id, content, link, img],
                (error, results, fields) => {
                  if (!error) {
                    // dosomething
                    res.json({ insert: 'OK', success: true })
                  } else {
                    res.json({ insert: 'OK', success: false })
                  }
                }
              )
            }
          })
        } else if (data[0].status == 'review' && req.body.action == 'cancel') {
          //UPDATE
          console.log('bodyaction', req.body.action)
          db.queryAsync(
            `DELETE from friend_list  WHERE sid = ${data[0].sid}`
          ).then(result => {
            console.log('changeRows', result.changedRows)
            if (result.changedRows == 0) {
              console.log('DELETE SUCCESS')

              //DELETE notice
              var delNotice = `DELETE FROM member_notice WHERE (member_id=${toID} || send_id=${toID}) && (send_id=${user_id} || member_id=${user_id})`
              db.query(delNotice, (error, results, fields) => {
                if (!error) {
                  // dosomething
                  res.json({ UPDATEDEL: 'OK', success: true })
                } else {
                  res.json({ UPDATEDEL: 'OK', success: false })
                }
              })
            }
          })
        } else if (data[0].status == 'delete') {
          db.queryAsync(
            `UPDATE friend_list SET  status = ? WHERE sid = ${data[0].sid}`,
            ['review']
          ).then(result => {
            if (result.changedRows >= 1) {
              console.log('UPDATE SUCCESS')

              //--------------給一般會員的通知----------------------------------------------
              // query
              var noticeSql =
                'INSERT INTO `member_notice`(`member_id`,`send_id`, `content`, `link`, `img`) VALUES (?,?,?,?,?)'
              db.query(
                noticeSql,
                [toID, user_id, content, link, img],
                (error, results, fields) => {
                  if (!error) {
                    // dosomething
                    res.json({ UPDATErev: 'OK', success: true })
                  } else {
                    res.json({ UPDATErev: 'OK', success: false })
                  }
                }
              )
            }
          })
        } else if (data[0].status == 'review' && req.body.action == 'confirm') {
          db.queryAsync(
            `UPDATE friend_list SET  status = ? WHERE sid = ${data[0].sid}`,
            ['approve']
          ).then(result => {
            if (result.changedRows >= 1) {
              console.log('UPDATE SUCCESS')
              res.json({ UPDATEapprove: 'OK' })
            }
          })
        }
      })
    }
  )

  //
})

//POST DATA

//check if chat_header is null
router.post('/chat_headerInsert/:user_id/:to_id', (req, res) => {
  let bodyData = req.body
db.queryAsync(`SELECT count(*) headerCount FROM chat_header WHERE ((from_id=${req.params.user_id} || from_id=${req.params.user_id}) || (to_id=${req.params.to_id} || to_id=${req.params.to_id} ))`)
.then(count=>{
  if(count[0].headerCount==0){
    db.queryAsync('INSERT INTO `chat_header` SET ? ', {
      from_id: bodyData.applicant,
      to_id: bodyData.addFriendId,
      subject: null,
      time: bodyData.time,
      create_time: bodyData.create_time,
    }).then(result=>{console.log("addheader")
  res.json("addchatHeaderOK")})
  }
})
})


//post message
router.post('/message/:user_id/:to_id', (req, res) => {
  console.log('req id:', req.params.user_id)
  console.log('req id:', req.params.to_id)
  let bodyData = req.body
  console.log('check post', req.body)
  // console.log(bodyData)
  console.log('postms', bodyData.msec)


  // uid: this.state.from_u_id,
  //       to_uid: this.state.to_u_id,
  //       username: this.state.from_member_name,
  //       message: inputContent,
  //       time: this.generateTime(),
  //       msec: new Date().getTime(),
  //       roomID: this.state.roomID,
  //       h_id: this.state.member_chat_data[0].h_id,
  //       is_readed: 0,
  //       urlSender: this.props.photoURL,

  
 
  db.queryAsync(
    'SELECT `m_sec` FROM `chat_message` ORDER BY `time` DESC LIMIT 1'
  ).then(old_data_ms => {
    console.log('oldms', old_data_ms[0].m_sec)
    if (bodyData.msec != old_data_ms[0].m_sec) {
      //insert
      db.queryAsync('INSERT INTO `chat_message` SET ? ', {
        header_id: bodyData.h_id,
        sender_id: bodyData.uid,
        content: bodyData.message,
        is_readed: bodyData.is_readed,
        time: bodyData.time,
        m_sec: bodyData.msec,
        receiver_id: bodyData.to_uid,
      }).then(result => {
        if (result.affectedRows === 1) {
          console.log('insert data success')
          res.json('DO REFRESH')
          //UPDATE
          db.queryAsync(
            'UPDATE chat_header SET subject = ?, time = ? WHERE id = ?',
            [bodyData.message, bodyData.time, bodyData.h_id]
          ).then(result => {
            if (result.changedRows >= 1) {
              console.log('UPDATE SUCCESS')
            }
          })
        }
      })
    }
  })
})

module.exports = router

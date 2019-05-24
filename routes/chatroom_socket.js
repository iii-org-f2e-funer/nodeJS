var express = require('express');
// var app = express();
const router=express.Router();
const mysql=require("mysql");
const bluebird=require("bluebird");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//連接socket io
server.listen(8080, () => {
    console.log(new Date() + 'Socket.io Successfully connect to port 8080');
  });

  //socket io 後台資料處理
  io.on('connection', function(socket) {
    let id = socket.id;
    console.log('socketID', id);
    socket.on("join",data=>{
        socket.join(data)
        socket.emit("join",`chat in room`+data )
    })
    socket.on('newVisitor', function(data) {
      let innerLoginData = { userName: '', id: id };
      innerLoginData.userName = data;
      outPut.loginData = [innerLoginData, ...outPut.loginData];
      console.log(data);
      socket.emit('newVisitor', data);
      socket.broadcast.emit('newVisitor_all', data);
      //boardcast 廣播給除了自己以外的其他人, io 廣播給所有人包含自己
    });
    socket.on('disconnect', () => {
      var whoLeave = outPut.loginData.find(items => {
        return items.id === id;
      });
      console.log(whoLeave.userName + ' just leave the room..');
      socket.broadcast.emit('logout', whoLeave.userName);
    });
  });

//連線資料庫
const db=mysql.createConnection({
    host:"localhost",
    user:"root",  //root  PHLEE
    password:"", //""  au4a83
    database:"happy6",  //happy6  chatroom
  });
  db.connect(function(err){
    if(err){
      console.log('error connecting: ' + err.stack)
      return
    }
    console.log('連線成功--connected as id ' + db.threadId);
  });
  bluebird.promisifyAll(db);


  //去後台要聊天資料
router.get("/message/user_id1",(req,res)=>{
    db.queryAsync({
      sql: 'SELECT h.id h_id,h.create_time h_stime, m.id m_id, m.content m_cont, m.is_sender m_issender, m.time m_time,IF(m.is_sender, x.name,y.name) as sender, IF(!m.is_sender, x.name,y.name) as receiver,IF(m.is_sender, x.member_id,y.member_id) as sender_id, IF(!m.is_sender, x.member_id,y.member_id) as receiver_id  FROM(SELECT * FROM chat_header WHERE from_id=1) as h JOIN chat_message as m ON(h.id=m.header_id) JOIN member x ON(h.from_id=x.member_id) JOIN member y ON (h.to_id=y.member_id) ORDER BY m.time DESC',
  
      //{h_id: ,h_sub: ,m_id: ,m_sender: ,m_cont: ,m_time: }
  
      timeout: 40000, // 40s
      //values: ['David']
    }).then(data=> {
    //   console.log(data);
      res.json(data);
      // error will be an Error if one occurred during the query
      // results will contain the results of the query
      // fields will contain information about the returned results fields (if any)
    })
  })

  module.exports= router
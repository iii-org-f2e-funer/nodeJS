var express = require('express');
// var app = express();
const router=express.Router();
const mysql=require("mysql");
const bluebird=require("bluebird");


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
    console.log('connected as id ' + db.threadId);
  });
  bluebird.promisifyAll(db);


  //去後台要聊天資料
router.get("/message/user_id1",(req,res)=>{
    db.queryAsync({
      sql: 'SELECT h.id h_id, h.subject h_sub, m.id m_id, m.content m_cont, m.time m_time,IF(m.is_sender, x.user_id,y.user_id) as sender FROM(SELECT * FROM header WHERE id=1) as h JOIN message as m ON(h.id=m.header_id) JOIN user x ON(h.from_id=x.user_id) JOIN user y ON (h.to_id=y.user_id)',
  
      //{h_id: ,h_sub: ,m_id: ,m_sender: ,m_cont: ,m_time: }
  
      timeout: 40000, // 40s
      //values: ['David']
    }).then(data=> {
      console.log(data);
      res.send(data);
      // error will be an Error if one occurred during the query
      // results will contain the results of the query
      // fields will contain information about the returned results fields (if any)
    })
  })

  module.exports= router
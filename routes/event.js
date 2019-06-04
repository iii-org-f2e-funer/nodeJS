const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const multer = require('multer');
const upload = multer({dest: 'image/uploads/'})
const fs = require('fs');
const util = require('util')

const db = require('../utility/db.js')

router.get('/', (req, res) => {
    res.send("Hello")
});


//上傳揪團圖片
router.post('/imgupload', upload.single('pt_img'),(req,res) =>{
    // console.log(req.file);

    let ext ='';
    let filename = req.file.filename;
    let path = '//localhost:3002/images/event/'

    if(req.file && req.file.originalname){
      switch(req.file.mimetype){
        case 'image/png':
          ext = '.png';
          case 'image/jpeg':
            if(!ext){
              ext = '.jpg';
            }
            fs.createReadStream(req.file.path)
            .pipe(fs.createWriteStream(__dirname + '/../public/images/event/' + filename + ext));

            res.json({
                success: true,
                file: filename + ext,
                filepath:  filename + ext,
                name: req.body.name
            });
            return;
      }
    }
})
//讀取區域廠商
router.post('/loadadd', upload.single(),(req,res) =>{
  let pt_city = req.body.pt_city
  let pt_dist = req.body.pt_dist
  
  let sql ="SELECT `sid`,`firmname`,`city`,`dist`,`address` FROM `firm_manage` WHERE `city` = (?) AND `dist`= (?)"

  db.query(sql, [pt_city, pt_dist], (error, results, fields) =>{

    res.json(results)
  })
})

//新增揪團
router.post('/newptsubmit', upload.single(),(req,res) =>{

  let  sql = "INSERT INTO `party_manage`(`pt_host`, `pt_img`, `pt_member`, `pt_maxm`,`pt_time`, `pt_endtime`, `pt_city`, `pt_dist`, `pt_add`, `pt_title`, `pt_info`,`pt_level` ) VALUES (?,?,?,?,?,?,?,?,?,?,?,? )";
// console.log(req.body)
    db.query(sql, [ req.body.pt_host, 
                    req.body.pt_img, 
                    req.body.pt_member,
                    req.body.pt_maxm,
                    req.body.pt_time,
                    req.body.pt_endtime,
                    req.body.pt_city,
                    req.body.pt_dist,
                    req.body.pt_add,
                    req.body.pt_title,
                    req.body.pt_info,
                    req.body.pt_level], (error, results, fields) => {

      if (!error) {
          res.json({ success: true })
      } else {
          res.json({ success: false })
      }
    })
});

//修改揪團
router.post('/editpt', upload.single(),(req,res) =>{

  let  sql = "UPDATE `party_manage` SET `pt_img`=(?),`pt_member`=(?),`pt_maxm`=(?),`pt_time`=(?),`pt_endtime`=(?),`pt_city`=(?),`pt_dist`=(?),`pt_add`=(?),`pt_title`=(?),`pt_info`=(?),`pt_level`=(?) WHERE `pt_sid` = (?) ";

    db.query(sql, [ req.body.pt_img, 
                    req.body.pt_member,
                    req.body.pt_maxm,
                    req.body.pt_time,
                    req.body.pt_endtime,
                    req.body.pt_city,
                    req.body.pt_dist,
                    req.body.pt_add,
                    req.body.pt_title,
                    req.body.pt_info,
                    req.body.pt_level,
                    req.body.pt_sid], (error, results, fields) => {
            
      if (results.changedRows !== 1) {
          res.json({ errormsg:'資料沒有更新',success: false })
      } else {
          res.json({ errormsg:'', success: true })
      }
    })
});

//取消揪團
router.post('/cancelhost',function (req, res) {
  // console.log(req.body.pt_sid)
  let sql ='UPDATE `party_manage` SET `pt_state`= 0 WHERE `pt_sid` = (?)'
  db.query(sql, [ req.body.pt_sid], (error, results, fields) => {
  
    if (!error) {
      res.json({ success: true })
      } else {
      res.json({ success: false })
      }
    })
  });

//ptlist paginate
router.post('/ptlist',upload.none(),function (req, res) {  
  let PER_PAGE = 16;
  let offset = req.body.offset ? parseInt(req.body.offset, 10) : 0;
  let nextOffset = offset + PER_PAGE;
  let previousOffset = offset - PER_PAGE < 1 ? 0 : offset - PER_PAGE;
 
  var str = ''
    if (req.body.searchterm !== "" && req.body.searchterm!== undefined ){
      str += " AND `pt_host` LIKE '%"+ req.body.searchterm +"%' OR `pt_add` LIKE '%"+ req.body.searchterm +"%' OR `pt_title` LIKE '%"+ req.body.searchterm +"%'"
    }
    if (req.body.searchcity !== "" && req.body.searchcity!== undefined ){
      str += " AND `party_manage`.`pt_city` = '" + req.body.searchcity + "'"
    }
    if (req.body.searchdist !== "" && req.body.searchdist!== undefined){
      str += " AND `party_manage`.`pt_dist` = '" + req.body.searchdist + "'"
    }
    if (req.body.searchstarttime !== "" && req.body.searchstarttime!== undefined){
      str += " AND `party_manage`.`pt_time` >= '" + req.body.searchstarttime + "'"
    }
    if (req.body.searchendtime !== "" && req.body.searchendtime!== undefined){
      str += " AND `party_manage`.`pt_time` <= '" + req.body.searchendtime + "'"
    }
    if (req.body.searchlevel !== "" && req.body.searchlevel!== undefined){
      str += " AND `party_manage`.`pt_level` = '" + req.body.searchlevel + "'"
    }

    // console.log(str)
  let sql = 'SELECT `party_manage`.*,`member`.`photo`,`member`.`member_id` FROM `party_manage` LEFT JOIN `member` ON `party_manage`.`pt_host` = `member`.`account` WHERE `party_manage`.`pt_state` = 1' + str + ' ORDER BY `pt_sid` desc'
  db.query(sql, (error, results, fields) => {
    let items = results;    
    
    function getPaginatedItems(items, offset) {
      return items.slice(offset, offset + PER_PAGE);
    }

    let meta = {
      limit: PER_PAGE,
      next: util.format('?limit=%s&offset=%s', PER_PAGE, nextOffset),
      offset: req.query.offset,
      previous: util.format('?limit=%s&offset=%s', PER_PAGE, previousOffset),
      total_count: items.length
    };
  
    let json = {
      meta: meta,
      items: getPaginatedItems(items, offset),
    };
    return res.json(json)
     })

}
)
//讀取揪團頁面資料
router.post('/ptinfopage',function (req, res) {  
  
  let ptsid=req.body.ptsid;
  let sql = 'SELECT * FROM `party_manage` WHERE `pt_sid`=(?)';

  db.query(sql, [ptsid], (error, results, fields) => {
    results[0].pt_info = results[0].pt_info.replace(/\r\n/g,"<br />")
    let pt_host = results[0].pt_host
    // console.log(pt_host)
    let membersql = 'SELECT `photo`, `name`, `nickname`,`member_id` FROM `member` WHERE `account` = (?)';
      db.query(membersql,[pt_host],(error, results2, fields) =>{
        results = Object.assign(results[0],results2[0])

        res.json(results)
      })
  })
});

//讀取編輯揪團頁面資料
router.post('/ptinfo',function (req, res) {  
  
  let ptsid=req.body.ptsid;
  let sql = 'SELECT * FROM `party_manage` WHERE `pt_sid`=(?)';

  db.query(sql, [ptsid], (error, results, fields) => {
    let pt_host = results[0].pt_host
    // console.log(pt_host)
    let membersql = 'SELECT `photo`, `name`, `nickname`,`member_id` FROM `member` WHERE `account` = (?)';
      db.query(membersql,[pt_host],(error, results2, fields) =>{
        results = Object.assign(results[0],results2[0])

        res.json(results)
      })
  })
});

//報名者名單
router.post('/ptapplyer',function (req, res) {  
    // console.log(req.body)
  let ptsid=req.body.ptsid;
  let sql = 'SELECT `party_apply`.* ,`member`.`photo`,`member`.`name`,`member`.`nickname`,`member`.`member_id` FROM `party_apply` LEFT JOIN `member` ON `party_apply`.`pt_applymember` = `member`.`account` WHERE `party_apply`.`pt_sid`= (?) AND `pt_applystatus` != "cancel"';

  db.query(sql, [ptsid], (error, results, fields) => {
        res.json(results)
      })
  })

  //審核報名者名單
router.post('/commitptapplyer',function (req, res) {  
  // console.log(req.body)
let ptsid=req.body.ptsid;
let sql = 'SELECT `party_apply`.* ,`member`.`photo`,`member`.`name`,`member`.`member_id` FROM `party_apply` LEFT JOIN `member` ON `party_apply`.`pt_applymember` = `member`.`account` WHERE `party_apply`.`pt_sid`= (?) AND `pt_applystatus` = "pending"';

db.query(sql, [ptsid], (error, results, fields) => {
      res.json(results)
    })
})

//新增報名參團
router.post('/apply',function (req, res) {

  let hostid=req.body.hostid
  let ptsid=req.body.pt_sid
  let pthost=req.body.pt_host
  let ptapplymem=req.body.ptapplymem
  let applyresult = {success: false, errormsg:'',applyinfo:''}
// console.log(hostid)
  let testsql = 'SELECT COUNT(1) FROM `party_apply` WHERE `pt_sid` = (?) AND `pt_applymember` = (?) AND `pt_applystatus` ="pending"'
  //檢查報名自己的團
  if(pthost == ptapplymem){
    applyresult['errormsg'] = '無法報名自己的揪團喔'

    return res.json(applyresult)
  }else{
    //檢查重複報名
    db.query(testsql, [ptsid, ptapplymem], (error, results, fields) => {
    if(results[0]['COUNT(1)'] !== 0){
      applyresult['errormsg'] = '你已經報名這個揪團過摟'

      return res.json(applyresult)
    } else {
      //送出報名
      let sql ='INSERT INTO `party_apply`(`pt_sid`, `pt_host`, `pt_applymember`) VALUES (?,?,?)'
      db.query(sql, [ptsid, pthost,ptapplymem], (error, results, fields) => {
        applyresult['success'] = true
        applyresult['applyinfo'] = results

        
        //送通知
        //--------------給一般會員的通知----------------------------------------------

          const member_id = hostid; //收信人 會員 membet_id
          const content = "你收到了一則開團申請，請記得前往審核"; //內文 
          const link = "/member/userevent" //通知點下去要連到哪
          const img = 'http://localhost:3002/public/images/event/002.jpg' //圖片網址

          // query
          var sql = "INSERT INTO `member_notice`(`member_id`, `content`, `link`, `img`) VALUES (?,?,?,?)"
          db.query(sql, [member_id, content, link, img], (error, results, fields) => {
              if (!error) {
                  // dosomething
                  return res.json(applyresult)
              } else {
                return res.json(applyresult)
              }
          });
//---------------------------------------------------------------------------
    })
    }
  })
  }  
})

//取消報名揪團
router.post('/cancelapply',function (req, res) {
// console.log(req.body.applysid)
let sql ='UPDATE `party_apply` SET `pt_applystatus` = "cancel" WHERE `party_apply`.`pt_applysid` = (?)'
db.query(sql, [ req.body.applysid], (error, results, fields) => {

  if (!error) {
    res.json({ success: true })
    } else {
    res.json({ success: false })
    }
  })
});

//審核報名
router.post('/commit',function (req, res) {
  // console.log(req.body)
  let applyerid =req.body.applyerid
  let sql ='UPDATE `party_apply` SET `pt_applystatus`= (?) WHERE `pt_applysid` = (?)'
  db.query(sql, [ req.body.result,req.body.pt_applysid], (error, results, fields) => {
  
    if (!error) {
          //--------------給一般會員的通知----------------------------------------------

          const member_id = applyerid; //收信人 會員 membet_id
          const content = "你的揪團申請已審核，請到我的揪團查看結果"; //內文 
          const link = "/member/userevent" //通知點下去要連到哪
          const img = 'http://localhost:3002/public/images/event/002.jpg' //圖片網址
    
          // query
          var sql = "INSERT INTO `member_notice`(`member_id`, `content`, `link`, `img`) VALUES (?,?,?,?)"
          db.query(sql, [member_id, content, link, img], (error, results, fields) => {
              if (!error) {
                  // dosomething
                  res.json({ success: true })
              } else {
                res.json({ success: false })
              }
          });
    
    //---------------------------------------------------------------------------r
      
    
    } else {
      res.json({ success: false })
      }

    })
  });

//抓取使用者的申請紀錄
router.post('/applyedpt',function (req, res) {  
  let sql = 'SELECT * FROM `party_apply` LEFT JOIN `party_manage` ON `party_apply`.`pt_sid`=`party_manage`.`pt_sid` WHERE `party_apply`.`pt_applymember` = (?) AND `party_manage`.`pt_state`=1 AND `pt_applystatus` != "cancel"'
  db.query(sql, [req.body.account], (error, results, fields) => {
    // console.log(results)
    res.json(results)
  })
   })

   //抓取使用者的開團紀錄
router.post('/hostedpt',function (req, res) {  
  let sql = 'SELECT * FROM `party_manage` WHERE `pt_host` = (?)'
  db.query(sql, [req.body.account], (error, results, fields) => {
    // console.log(results)
    res.json(results)
  })
   })
module.exports = router;
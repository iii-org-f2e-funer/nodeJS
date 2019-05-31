

//自己貼到你要送通知的地方


//--------------給一般會員的通知----------------------------------------------

const member_id = 1; //收信人 會員 membet_id
const content = "我是內文"; //內文 
const link = "" //通知點下去要連到哪
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

//---------------------------------------------------------------------------



//---------------給廠商的通知----------------------------------------------

const firm_id = 1; //收信人 廠商sid
const content = "我是內文"; //內文 
const link = "" //通知點下去要連到哪
const img = 'http://localhost:3002/public/images/member/005.jpg' //圖片網址

// query
var sql = "INSERT INTO `firm_notice`(`firm_id`, `content`, `link`, `img`) VALUES (?,?,?,?)"
db.query(sql, [firm_id, content, link, img], (error, results, fields) => {
    if (!error) {
        // dosomething
        res.json({ success: true })
    } else {
        res.json({ success: false })
    }
});
//---------------------------------------------------------------------------


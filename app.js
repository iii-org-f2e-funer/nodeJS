const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const url = require('url')
const mysql = require('mysql')
const session = require('express-session')
const app = express()

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'happy6'
});
// Error handling
db.connect((error) => {
    if (error) {
        console.log('MySQL連線失敗 Error: ' + error.code)
    }
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var whitelist = ['http://localhost:3000', undefined, 'http://localhost:3002']
var corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors(corsOptions))


app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'happy6',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },  //30天
}));

var user
app.get('/UserInfo', function (req, res) {
    console.log(user)
    let sql = "SELECT * FROM `firm_manage` WHERE `account` = (?)"
    db.query(sql, [user], (error, results, fields) => {
        if (results[0] === undefined) {
            res.send("no data")
            return
        }

    })
})

app.post('/firmLogin', function (req, res) {
    const data = { success: false, message: '' }
    data.body = req.body
    let sql = "SELECT * FROM `firm_manage` WHERE `account` = (?)"
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
    });


})

// routes 
const test = require('./routes/test')
app.use('/test', test)

app.listen(3002, function () {
    console.log('nodeJS started on port 3002')
})
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const app = express()
const url = require('url')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var whitelist = ['http://localhost:3000']
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

const session = require('express-session');
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'happy6',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },  //30天
}));

app.get('/', function (req, res) {
    res.send("hello")
})

app.post('/firmLogin', function (req, res) {
    res.json({
        message: 'success login',
        body: req.body
    })
})

app.listen(3001, function () {
    console.log('port 3001 listen')
})
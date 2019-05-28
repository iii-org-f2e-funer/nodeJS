const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const url = require('url')
const mysql = require('mysql')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const app = express()
const db_config = require('./datebase_config.js')
const db = mysql.createConnection(db_config)

app.use(express.static('public'))
// Error handling
db.connect(error => {
  if (error) {
    console.log('MySQL連線失敗 Error: ' + error.code)
  } else {
    console.log('Good!! MySQL Connection successful')
  }
})

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var whitelist = ['http://localhost:3000', undefined, 'http://localhost:3002']
var corsOptions = {
  credentials: true,
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}
app.use(cors(corsOptions))

app.use(express.static('public'))

app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: 'happy6',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }, //30天
  })
)

// member
const member = require('./routes/member')
app.use('/member', member)

// firm
const firm = require('./routes/firm')
app.use('/firm', firm)

//product
const product = require('./routes/product')
app.use('/product', product)

//chatroom
const chatroom = require('./routes/chatroom_socket')
app.use('/chatroom', chatroom)

// instagram
const instagram = require('./routes/instagram')
app.use('/instagram', instagram)

// event
const event = require('./routes/event')
app.use('/event', event)

const gameMap = require('./routes/gameMap')
app.use('/gameMap', gameMap)

app.listen(3002, function() {
  console.log('nodeJS started on port 3002')
})

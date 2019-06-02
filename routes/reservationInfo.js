const express = require('express');
const router = express.Router();
const db = require('../utility/db.js');
const axios = require('axios');
const nodemailer = require('nodemailer');
const moment = require('moment');
const uuidv1 = require('uuid/v1');
const multer = require('multer');
const session = require('express-session');

router.get('/', function(req, res) {
	console.log(req.session);
	const data = { success: false, isFirm: req.session.isFirm };
	if (req.session.isFirm) {
		console.log('isFirmOOOOO');
	} else {
		let sql2 = 'SELECT * FROM `site_reservation` WHERE `user_id` = (?)';
		db.query(sql2, [ req.session.userSid ], (error2, results2, fields2) => {
			console.log(results2);
			if (results2[0] === undefined) {
				res.json(data);
			} else {
				data.success = true;
				data.body = results2;
				// date轉換
				data.body.birthday = moment(data.body.birthday).format('YYYY-MM-DD');
				// console.log(moment(data.body.birthday))
				// console.log(moment(data.body.birthday, ['YYYY-MM-DD']))
				res.json(data);
			}
		});
	}
});

module.exports = router;

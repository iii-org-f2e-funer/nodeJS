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
		let sql1 = 'SELECT *  FROM `site_reservation` WHERE `site_id` = (?) ORDER BY `sid` DESC';
		db.query(sql1, [ req.session.userSid ], (error1, results1, fields1) => {
			console.log(results1);
			if (results1[0] === undefined) {
				res.json(data);
			} else {
				data.success = true;
				data.body = results1;
				// date轉換
				// data.body.birthday = moment(data.body.birthday).format('YYYY-MM-DD');
				// console.log(moment(data.body.birthday))
				// console.log(moment(data.body.birthday, ['YYYY-MM-DD']))
				res.json(data);
			}
		});
	} else {
		let sql2 = 'SELECT * FROM `site_reservation` WHERE `user_id` = (?) ORDER BY `sid` DESC';
		db.query(sql2, [ req.session.userSid ], (error2, results2, fields2) => {
			console.log(results2);
			if (results2[0] === undefined) {
				res.json(data);
			} else {
				data.success = true;
				data.body = results2;
				// date轉換
				// data.body.birthday = moment(data.body.birthday).format('YYYY-MM-DD');
				// console.log(moment(data.body.birthday))
				// console.log(moment(data.body.birthday, ['YYYY-MM-DD']))
				res.json(data);
			}
		});
	}
});

router.put('/', function(req, res) {
	console.log(req.session);
	console.log('PUT');
	console.log(req.body);
	const data = { success: false, isFirm: req.session.isFirm };
	if (req.session.isFirm) {
		// let sql1 = 'SELECT *  FROM `site_reservation` WHERE `site_id` = (?)';
		let sql1_check = 'UPDATE `site_reservation` SET `status` = (?) WHERE `site_reservation`.`sid` = (?)';
		db.query(sql1_check, [ '1', req.body.sid ], (error1, results1, fields1) => {
			console.log(results1);
			if (results1[0] === undefined) {
				res.json(data);
			} else {
				data.success = true;
				data.body = results1;
				// date轉換
				// data.body.birthday = moment(data.body.birthday).format('YYYY-MM-DD');
				// console.log(moment(data.body.birthday))
				// console.log(moment(data.body.birthday, ['YYYY-MM-DD']))
				res.json(data);
			}
		});
	} else {
		let sql2_cancel = 'UPDATE `site_reservation` SET `status` = (?) WHERE `site_reservation`.`sid` = (?)';
		db.query(sql2_cancel, [ '9', req.body.sid ], (error2, results2, fields2) => {
			console.log(results2);
			if (results2[0] === undefined) {
				res.json(data);
			} else {
				data.success = true;
				data.body = results2;
				// date轉換
				// data.body.birthday = moment(data.body.birthday).format('YYYY-MM-DD');
				// console.log(moment(data.body.birthday))
				// console.log(moment(data.body.birthday, ['YYYY-MM-DD']))
				res.json(data);
			}
		});
	}
});

module.exports = router;

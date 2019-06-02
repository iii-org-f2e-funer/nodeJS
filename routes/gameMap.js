const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const url = require('url');
const mysql = require('mysql');
const session = require('express-session');
const app = express();
const router = express.Router();

const db = require('../utility/db.js');
const cityCodeToString = require('./gameMapSql.js');

function awsSNS(sendMessage, sendPhoneNum) {
	let sendMsg = require('aws-sns-sms');
	let awsConfig = {
		accessKeyId: 'AKIAXGD4INLYUEW3LX3X',
		secretAccessKey: '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',
		region: 'ap-northeast-1'
	};

	let msg = {
		message: sendMessage,
		sender: 'VISHAL',
		phoneNumber: sendPhoneNum // phoneNumber along with country code
	};
	let ok = sendMsg(awsConfig, msg)
		.then((data) => {
			console.log('Message sent');
			return 1;
		})
		.catch((err) => {
			consolr.log(err);
		});
	if (ok) return 1;
}

router.get('/', (req, res) => {
	let sql = 'SELECT site_manage.* FROM `site_manage';
	// let sql = "SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id"
	db.query(sql, (error, results, fields) => {
		res.json(results);
	});
});

router.get('/sid/:sidCode', (req, res) => {
	let sqlCityString = cityCodeToString(req.params.cityCode);
	let isOk = false;
	let sql = 'SELECT site_manage.* FROM `site_manage` where `sid`=(?)';
	db.query(sql, [ req.params.sidCode ], (error, results, fields) => {
		let newArray = [];

		for (let index in results) {
			let img_sid = results[index]['sid'];
			let img_sql =
				'SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `site_id`=(?)';
			db.query(img_sql, img_sid, (error2, results2, fields2) => {
				let imgArray = [];
				if (results2) {
					for (let index in results2) {
						imgArray.push(results2[index]['image_path']);
					}
				}
				results[index]['imageArray'] = imgArray;
				newArray.push(results[index]);
				// console.log('process....');
				if (newArray.length === results.length) {
					res.json(newArray);
				}
			});
		}
	});

	// let sqlCityString = cityCodeToString(req.params.cityCode);
	// console.log(req.params);
	// let sql = 'SELECT site_manage.* FROM `site_manage` where `county`=(?)';
	// // let sql = "SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `county`=(?)"
	// db.query(sql, [ sqlCityString ], (error, results, fields) => {
	// 	if (error) {
	// 		console.log(error);
	// 	}
	// 	console.log(results);

	// 	res.json(results);
	// });
});

router.get('/city/:cityCode?', (req, res) => {
	let sqlCityString = cityCodeToString(req.params.cityCode);
	let isOk = false;
	let sql = 'SELECT site_manage.* FROM `site_manage` where `county`=(?)';
	db.query(sql, [ sqlCityString ], (error, results, fields) => {
		let newArray = [];

		for (let index in results) {
			let img_sid = results[index]['sid'];
			let img_sql =
				'SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `site_id`=(?)';
			db.query(img_sql, img_sid, (error2, results2, fields2) => {
				let imgArray = [];
				if (results2) {
					for (let index in results2) {
						imgArray.push(results2[index]['image_path']);
					}
				}
				results[index]['imageArray'] = imgArray;
				newArray.push(results[index]);
				// console.log('process....');
				if (newArray.length === results.length) {
					// console.log('finish');
					res.json(newArray);
				}
			});
		}
	});

	// let sqlCityString = cityCodeToString(req.params.cityCode);
	// console.log(req.params);
	// let sql = 'SELECT site_manage.* FROM `site_manage` where `county`=(?)';
	// // let sql = "SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `county`=(?)"
	// db.query(sql, [ sqlCityString ], (error, results, fields) => {
	// 	if (error) {
	// 		console.log(error);
	// 	}
	// 	console.log(results);

	// 	res.json(results);
	// });
});

router.get('/img/', (req, res) => {
	let sql = 'SELECT * FROM `site_image`';
	// let sql = "SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `county`=(?)"
	db.query(sql, (error, results, fields) => {
		if (error) {
			console.log(error);
		}
		res.json(results);
	});
});

router.get('/img/:sid', (req, res) => {
	if (req.params.sid) {
		sid = req.params.sid;
	}
	// let sql = "SELECT * FROM `site_image` WHERE `site_id`= (?)"
	// if (req.params.sid){ sid = req.params.sid }
	let sql =
		'SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `site_id`=(?)';
	db.query(sql, [ sid ], (error, results, fields) => {
		if (error) {
			console.log(error);
		}
		console.log(results);
		let imgArray = [];
		if (results) {
			results.forEach(function(value, index) {
				imgArray.push(results[index]['image_path']);
			});
		}

		res.json(results);
		//   res.json({"imgArray":imgArray});
	});
});

router.get('/All/:query?', (req, res) => {
	let isOk = false;
	let query = req.params.query || '';
	// let query = '桌遊';
	let sql = 'select * from `site_manage` where `store` like  "%' + query + '%"';
	console.log(sql);
	// let sql = 'SELECT * FROM `site_manage`  WHERE `store` LIKE %' + query + '%';
	db.query(sql, (error, results, fields) => {
		if (results.length === 0) {
			res.json([ 'nodata' ]);
		} else {
			let newArray = [];

			for (let index in results) {
				let img_sid = results[index]['sid'];
				let img_sql =
					'SELECT site_manage.* , site_image.* FROM `site_manage` LEFT JOIN `site_image` ON site_manage.sid= site_image.site_id where `site_id`=(?)';
				db.query(img_sql, img_sid, (error2, results2, fields2) => {
					let imgArray = [];
					if (results2) {
						for (let index in results2) {
							imgArray.push(results2[index]['image_path']);
						}
					}
					results[index]['imageArray'] = imgArray;
					newArray.push(results[index]);

					if (newArray.length === results.length) {
						// console.log(newArray);

						res.json(newArray);
					}
				});
			}
		}
	});
});
router.get('/test', (req, res) => {
	// console.log(req.session);
	res.json({ success: true });
});
router.post('/reservation', (req, res) => {
	// console.log(req.session);
	console.log(req.body.date);
	let initData = [
		req.body.userId,
		req.body.firm_id,
		req.body.phone,
		req.body.name,
		req.body.people,
		req.body.date,
		req.body.store,
		'NoRemark'
	];
	// initData.unshift(21047); /////////userID
	let sql =
		'INSERT INTO `site_reservation` ( `user_id`, `site_id`, `phone`, `name`, `peoples`, `date`, site_name, `remark`) VALUES ( ?, ?, ?, ?, ?, ?, ?,?);';
	// 'INSERT INTO `site_reservation` ( `user_id`, `name`, `phone`, `peoples`, `date`, `remark`)  VALUES ( ?, ?, ?, ?, ?, ?);';

	let query = db.query(sql, initData, (error, results, fields) => {
		if (error) throw error;
		if (results.affectedRows === 1) {
			// console.log(req.body);
			date = new Date(req.body.date);
			year = date.getFullYear();
			month = date.getMonth() + 1;
			dt = date.getDate();

			if (dt < 10) {
				dt = '0' + dt;
			}
			if (month < 10) {
				month = '0' + month;
			}
			let SMS_Msg = `FUNer場地預約成功!!//場地:${req.body.store}//人數:${req.body.people}//預約時間:${year}-${month}-${dt}`;
			let SMS_PhoneNum = req.body.phone.replace(/\d{2}/, '+8869');
			// let status = awsSNS(SMS_Msg, SMS_PhoneNum);
			console.log(SMS_Msg);
			console.log(SMS_PhoneNum);
			// if (status) {
			if (1) {
				res.send('ok');
			}
		} else {
		}
	});
	console.log(query.sql);
});

module.exports = router;

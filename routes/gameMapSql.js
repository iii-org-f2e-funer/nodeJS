function CityCodeTrans(cityCode) {
	switch (cityCode) {
		case '101':
			return '台北市';
		case '102':
			return '新北市';

		default:
			return 'city code not match';
	}
}

module.exports = CityCodeTrans;

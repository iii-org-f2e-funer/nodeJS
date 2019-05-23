function CityCodeTrans (cityCode){
    switch (cityCode) { 
     case '100': 
        return '台北市' 
     case '101': 
        return '新北市' 

    default: 
        return 'city code not match'; 
    }

}


module.exports =  CityCodeTrans
function formatSeconds(value) {
    let secondTime = value;// 秒
    let minuteTime = 0;// 分
    let hourTime = 0;// 小时
    let dayTime = 0;// 天
    if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = Math.floor(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = Math.floor(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if (minuteTime > 60) {
            //获取小时，获取分钟除以60，得到整数小时
            hourTime = Math.floor(minuteTime / 60);
            //获取小时后取佘的分，获取分钟除以60取佘的分
            minuteTime = Math.floor(minuteTime % 60);


            //如果小时大于24，将小时转换成天数
            if (hourTime > 24) {
                //获取天数，获取小时数除以24，得到整数天数
                dayTime = Math.floor(hourTime / 24);
                //获取小时后取佘的分，获取分钟除以60取佘的分
                hourTime = Math.floor(hourTime % 24);
            }
        }


    }
    let result = "" + secondTime + "秒";

    if (minuteTime > 0) {
        result = "" + minuteTime + "分" + result;
    }
    if (hourTime > 0) {
        result = "" + hourTime + "小时" + result;
    }

    if (dayTime > 0) {
        result = "" + dayTime + "天" + result;
    }

    return result;
}

export default formatSeconds;
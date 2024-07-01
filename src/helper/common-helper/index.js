// rpx转化为px
export const rpx2px = ({
    rpx
}) => {

    let deviceWidth = uni.getSystemInfoSync().windowWidth; //获取设备屏幕宽度

    let px = (deviceWidth / 750) * Number(rpx);

    return Math.floor(px);

};

// 获取周几
export const getWeekday = ({
    day
}) => {

    let weekday = '';

    switch (day) {
        case 0:
            weekday = '周日';
            break;
        case 1:
            weekday = '周一';
            break;
        case 2:
            weekday = '周二';
            break;
        case 3:
            weekday = '周三';
            break;
        case 4:
            weekday = '周四';
            break;
        case 5:
            weekday = '周五';
            break;
        case 6:
            weekday = '周六';
            break;
    }

    return weekday;

};
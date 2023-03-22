import moment from 'moment';
import _ from 'lodash-es';
import { minDate } from '@/constant';

// 云函数调用
export const callCloudFunction = ({
    name,
    data
}) => {

    return uniCloud.callFunction({
        name,
        data
    }).then(({ result: { status, msg, data = null } }) => {

        if (status === 200) {

            return Promise.resolve(data);

        } else {

            uni.showToast({ title: msg, icon: 'none' });

        }

    }).catch(err => {

        console.error('云函数调用失败', err);

        uni.showToast({ title: `云函数调用失败`, icon: 'none' });

    });

};

// 获取自从2022年6月1日起的时间选项
export const getDateOptions = () => {

    const startTime = moment(minDate);
    const endTime = moment();

    let allYearMonth = [];
    while (endTime > startTime || startTime.format('M') === endTime.format('M')) {
        allYearMonth.push(startTime.format('YYYY-MM'));
        startTime.add(1, 'month');
    }

    return _.groupBy(allYearMonth, value => value.substring(0, 4));

};

// rpx转化为px
export const rpx2px = ({
    rpx
}) => {

    let deviceWidth = uni.getSystemInfoSync().windowWidth; //获取设备屏幕宽度

    let px = (deviceWidth / 750) * Number(rpx);

    return Math.floor(px);

};

// 获取周几
export const getWeekday = ({ day }) => {

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
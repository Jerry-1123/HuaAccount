import moment from 'moment';
import _ from 'lodash';
import { minDate } from '../constant';

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

// 获取星期几
export const getWeekdayByDay = ({
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

// 获取自从2022年10月1日起的时间选项
export const getStatisticsTimeOptions = () => {

    const startTime = moment(minDate);
    const endTime = moment();

    let allYearMonth = [];
    while (endTime > startTime || startTime.format('M') === endTime.format('M')) {
        allYearMonth.push(startTime.format('YYYY-MM'));
        startTime.add(1, 'month');
    }

    return _.groupBy(allYearMonth, value => value.substring(0, 4));

};

// 获取查询开始和结束时间
export const getSearchTimeRange = ({
    statisticsMode,
    statisticsMonthTime,
    statisticsYearTime
}) => {

    let startTime;
    let endTime;

    if (statisticsMode === 'month') {

        startTime = moment(statisticsMonthTime).startOf('month').format('YYYY-MM-DD');
        endTime = moment(statisticsMonthTime).add(1, 'month').startOf('month').format('YYYY-MM-DD');

    } else if (statisticsMode === 'year') {

        startTime = moment(statisticsYearTime).startOf('year').format('YYYY-MM-DD');
        endTime = moment(statisticsYearTime).add(1, 'year').startOf('year').format('YYYY-MM-DD');

    }

    return {
        startTime,
        endTime
    };

};

// rpx转化为px
export const rpx2px = ({
    rpx
}) => {

    let deviceWidth = uni.getSystemInfoSync().windowWidth; //获取设备屏幕宽度

    let px = (deviceWidth / 750) * Number(rpx);

    return Math.floor(px);

};

export const getExpensesColors = () => {

    return [
        "rgba(62,181,117,1.00)",
        "rgba(62,181,117,0.90)",
        "rgba(62,181,117,0.80)",
        "rgba(62,181,117,0.70)",
        "rgba(62,181,117,0.60)",
        "rgba(62,181,117,0.50)",
        "rgba(62,181,117,0.40)",
        "rgba(62,181,117,0.35)",
        "rgba(62,181,117,0.30)",
        "rgba(62,181,117,0.30)",
        "rgba(62,181,117,0.30)"
    ];

};

export const getIncomeColors = () => {

    return [
        "rgba(240,183,58,1.00)",
        "rgba(240,183,58,0.90)",
        "rgba(240,183,58,0.80)",
        "rgba(240,183,58,0.70)",
        "rgba(240,183,58,0.60)",
        "rgba(240,183,58,0.50)",
        "rgba(240,183,58,0.40)",
        "rgba(240,183,58,0.35)",
        "rgba(240,183,58,0.30)",
        "rgba(240,183,58,0.30)",
        "rgba(240,183,58,0.30)"
    ];

};
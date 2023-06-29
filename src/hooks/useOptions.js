import { ref } from 'vue';
import { minDate } from '@/constant';
import moment from 'moment';
import _ from 'lodash';

export const useOptions = () => {

    const dateOptions = ref([]);

    // 获取自从2022年6月1日起的时间选项
    const startTime = moment(minDate);
    const endTime = moment();

    let allYearMonth = [];

    while (endTime > startTime || startTime.format('M') === endTime.format('M')) {

        allYearMonth.push(startTime.format('YYYY-MM'));
        
        startTime.add(1, 'month');

    }

    dateOptions.value = _.groupBy(allYearMonth, value => value.substring(0, 4));

    return {
        dateOptions
    };

};

import _ from 'lodash';
import {
    ringChartConfig,
    columnChartConfiig,
    ringExpensesColor,
    ringIncomeColor
} from '@/constant';

export const useStatisticsSetting = () => {

    const getRingChartOpts = ({ billType }) => _.assign(
        ringChartConfig,
        {
            color: billType === 'expenses' ? ringExpensesColor : ringIncomeColor
        }
    );

    const getColumnChartOpts = ({ billType }) => _.assign(
        columnChartConfiig,
        {
            color: billType === 'expenses' ? ringExpensesColor : ringIncomeColor
        }
    );

    const changeColor = ({ billType }) => {

        if (billType === 'expenses') {

            uni.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#3eb575'
            });

            uni.setBackgroundColor({
                backgroundColorTop: '#3eb575'
            });

        } else {

            uni.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#f0b73a'
            });

            uni.setBackgroundColor({
                backgroundColorTop: '#f0b73a'
            });

        }

    };

    return {
        getRingChartOpts,
        getColumnChartOpts,
        changeColor
    };

};
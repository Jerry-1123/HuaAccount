import _ from 'lodash';
import { BillTypeEnum } from '@/enums';

const expensesColor = '#3eb575';

const incomeColor = '#f0b73a';

const expensesColorList = [
    "rgba(62,181,117,1.00)",
    "rgba(62,181,117,0.95)",
    "rgba(62,181,117,0.90)",
    "rgba(62,181,117,0.85)",
    "rgba(62,181,117,0.80)",
    "rgba(62,181,117,0.75)",
    "rgba(62,181,117,0.70)",
    "rgba(62,181,117,0.65)",
    "rgba(62,181,117,0.60)",
    "rgba(62,181,117,0.55)",
    "rgba(62,181,117,0.50)",
    "rgba(62,181,117,0.49)",
    "rgba(62,181,117,0.48)",
    "rgba(62,181,117,0.47)",
    "rgba(62,181,117,0.46)",
    "rgba(62,181,117,0.45)",
    "rgba(62,181,117,0.44)",
    "rgba(62,181,117,0.43)",
    "rgba(62,181,117,0.42)",
    "rgba(62,181,117,0.41)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.40)"
];

const incomeColorList = [
    "rgba(240,183,58,1.00)",
    "rgba(240,183,58,0.95)",
    "rgba(240,183,58,0.90)",
    "rgba(240,183,58,0.85)",
    "rgba(240,183,58,0.80)",
    "rgba(240,183,58,0.75)",
    "rgba(240,183,58,0.70)",
    "rgba(240,183,58,0.65)",
    "rgba(240,183,58,0.60)",
    "rgba(240,183,58,0.55)",
    "rgba(240,183,58,0.50)",
    "rgba(240,183,58,0.49)",
    "rgba(240,183,58,0.48)",
    "rgba(240,183,58,0.47)",
    "rgba(240,183,58,0.46)",
    "rgba(240,183,58,0.45)",
    "rgba(240,183,58,0.44)",
    "rgba(240,183,58,0.43)",
    "rgba(240,183,58,0.42)",
    "rgba(240,183,58,0.41)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.40)"
];

export const useStatisticsSetting = () => {

    const getRingChartOpts = ({ billType }) => {

        let config = {
            type: 'ring',
            padding: [10, 0, 0, 0],
            rotate: false,
            dataLabel: true,
            legend: {
                show: false
            },
            title: {
                name: ''
            },
            subtitle: {
                name: ''
            },
            extra: {
                ring: {
                    ringWidth: 30,
                    activeOpacity: 0.5,
                    activeRadius: 10,
                    offsetAngle: 0,
                    labelWidth: 15,
                    border: true,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    centerColor: '#ffffff'
                },
            },
            color: billType === BillTypeEnum.EXPENSES ? expensesColorList : incomeColorList
        };

        return config;

    };

    const getColumnChartOpts = ({ billType, isYearMode }) => {

        let config = {
            type: "column",
            dataLabel: false,
            enableScroll: false,
            padding: [20, 25, 20, 20],
            legend: {
                show: false
            },
            xAxis: {
                disableGrid: true,
            },
            yAxis: {
                disableGrid: true,
                data: [
                    {
                        axisLine: false,
                        format: 'customYAxisLabel'
                    }
                ]
            },
            extra: {
                column: {
                    type: "group",
                    activeBgColor: billType === BillTypeEnum.EXPENSES ? expensesColor : incomeColor,
                    activeBgOpacity: 0.2
                },
                tooltip: {
                    showArrow: false,
                    borderRadius: 5,
                    legendShow: false,
                    fontColor: "#fff"
                }
            },
            color: billType === BillTypeEnum.EXPENSES ? expensesColorList : incomeColorList
        };

        if (isYearMode) {

            config.xAxis.format = "customXAxisLabelForYear";

            config.extra.column.width = 16;
            config.extra.column.barBorderRadius = [0, 0, 0, 0];

        } else {

            config.xAxis.format = "customXAxisLabelForMonth";

            config.extra.column.width = 6;
            config.extra.column.barBorderRadius = [10, 10, 0, 0];

        }

        return config;

    };

    const changeColor = ({ billType }) => {

        if (billType === BillTypeEnum.EXPENSES) {

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
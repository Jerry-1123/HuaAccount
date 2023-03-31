import _ from 'lodash';

const expensesColor = '#3eb575';

const incomeColor = '#f0b73a';

const expensesColorList = [
    "rgba(62,181,117,1.00)",
    "rgba(62,181,117,0.80)",
    "rgba(62,181,117,0.70)",
    "rgba(62,181,117,0.60)",
    "rgba(62,181,117,0.50)",
    "rgba(62,181,117,0.45)",
    "rgba(62,181,117,0.40)",
    "rgba(62,181,117,0.35)",
    "rgba(62,181,117,0.30)",
    "rgba(62,181,117,0.30)"
];

const incomeColorList = [
    "rgba(240,183,58,1.00)",
    "rgba(240,183,58,0.80)",
    "rgba(240,183,58,0.70)",
    "rgba(240,183,58,0.60)",
    "rgba(240,183,58,0.50)",
    "rgba(240,183,58,0.45)",
    "rgba(240,183,58,0.40)",
    "rgba(240,183,58,0.35)",
    "rgba(240,183,58,0.30)",
    "rgba(240,183,58,0.30)",
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
            color: billType === 'expenses' ? expensesColorList : incomeColorList
        };

        return config;

    };

    const getColumnChartOpts = ({ billType, isYearMode }) => {

        let config = {
            type: "column",
            dataLabel: false,
            enableScroll: false,
            padding: [20, 20, 20, 20],
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
                        min: 0,
                        axisLine: false,
                        format: 'customYAxisLabel'
                    }
                ]
            },
            extra: {
                column: {
                    type: "group",
                    activeBgColor: billType === 'expenses' ? expensesColor : incomeColor,
                    activeBgOpacity: 0.2
                },
                tooltip: {
                    showArrow: false,
                    borderRadius: 5,
                    legendShow: false,
                    fontColor: "#fff"
                }
            },
            color: billType === 'expenses' ? expensesColorList : incomeColorList
        };

        if (isYearMode) {

            config.xAxis.format = "customXAxisLabelForYear";

            config.extra.column.width = 16;
            config.extra.column.barBorderRadius = [];

        } else {

            config.xAxis.format = "customXAxisLabelForMonth";

            config.extra.column.width = 6;
            config.extra.column.barBorderRadius = [10, 10, 0, 0];

        }

        return config;

    };

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
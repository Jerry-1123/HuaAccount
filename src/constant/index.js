export const defaultPageSize = 20;

export const defaultTagId = 'all';

export const minDate = '2022-06-01';

export const dateModeEnum = {
    month: 'month',
    year: 'year'
};

export const ringChartConfig = {
    type: 'ring',
    padding: [10, 0, 10, 0],
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
};

export const columnChartConfiig = {
    type: "column",
    padding: [15, 15, 0, 5],
    xAxis: {
        disableGrid: true,
    },
    yAxis: {
        data: [{ min: 0 }]
    },
    legend: {
    },
    extra: {
        column: {
            type: "group",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08
        },
    }
};

export const ringExpensesColor = [
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

export const ringIncomeColor = [
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

import _ from 'lodash';
import moment from 'moment';

export const getBillByBillId = ({
    billId
}) => {

    const db = uniCloud.database();

    const bill = db.collection('bill')
        .where(`_id == "${billId}"`)
        .getTemp();

    return db.collection(bill, 'tag')
        .get()
        .then(({ result }) => {

            return result.data && result.data.length === 1 ? result.data[0] : null;

        });

};

export const getDayBillCount = ({
    userId,
    billTime,
    billType
}) => {

    const db = uniCloud.database();

    return db.collection('bill')
        .where(`userId == "${userId}" && billTime == "${billTime}" && billType == "${billType}"`)
        .count()
        .then(({ result }) => {

            return result;

        });

};

export const createBill = ({
    userId,
    billType,
    expensesAmount = 0,
    incomeAmount = 0,
    remark = '',
    billTime,
    tagId,
}) => {

    const db = uniCloud.database();

    return db.collection('bill')
        .add({
            userId,
            billType,
            expensesAmount,
            incomeAmount,
            remark,
            billTime,
            tagId,
            createTime: new Date().getTime(),
            updateTime: new Date().getTime()
        });

};

export const updateBill = ({
    billId,
    billType,
    expensesAmount,
    incomeAmount,
    remark,
    billTime,
    tagId
}) => {

    const db = uniCloud.database();

    return db.collection('bill')
        .where(`_id == "${billId}"`)
        .update({
            billType,
            expensesAmount,
            incomeAmount,
            remark,
            billTime,
            tagId,
            updateTime: new Date().getTime()
        });

};

export const deleteBill = ({
    billId
}) => {

    const db = uniCloud.database();

    return db.collection('bill')
        .where(`_id == "${billId}"`)
        .remove();

};

export const getBillList = ({
    userId,
    tagId,
    pageNumber,
    pageSize,
    startTime,
    endTime
}) => {

    let billList = [];

    const db = uniCloud.database();

    let condition = `userId == "${userId}" && tagId == "${tagId}" && billTime >="${startTime}" && billTime < "${endTime}"`;

    if (tagId === 'all') {

        condition = `userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}"`;

    } else if (tagId === 'allExpenses') {

        condition = `userId == "${userId}" && billType == "expenses" && billTime >="${startTime}" && billTime < "${endTime}"`;

    } else if (tagId === 'allIncome') {

        condition = `userId == "${userId}" && billType == "income" && billTime >="${startTime}" && billTime < "${endTime}"`;

    }

    const bill = db.collection('bill')
        .where(condition)
        .orderBy('billTime desc, createTime desc')
        .skip(pageNumber * pageSize)
        .limit(pageSize)
        .getTemp();

    const tag = db.collection('tag')
        .getTemp();

    // 获取账单列表
    return db.collection(bill, tag)
        .get()
        .then(({ result: { data } }) => {

            billList = _.map(data, (item) => {

                return {
                    _id: item._id,
                    billTime: item.billTime,
                    billType: item.billType,
                    expensesAmount: item.expensesAmount,
                    incomeAmount: item.incomeAmount,
                    remark: item.remark,
                    tagName: item.tagId[0].tagName,
                    tagIcon: item.tagId[0].selectTagIcon
                };

            });

            let billTimeArray = _.map(_.groupBy(billList, 'billTime'), (value, key) => key);

            let groupCondition = `userId == "${userId}" && tagId == "${tagId}" && billTime in ${JSON.stringify(billTimeArray)}`;

            if (tagId === 'all') {

                groupCondition = `userId == "${userId}" && billTime in ${JSON.stringify(billTimeArray)}`;

            } else if (tagId === 'allExpenses') {

                groupCondition = `userId == "${userId}" && billType == "expenses" && billTime in ${JSON.stringify(billTimeArray)}`;

            } else if (tagId === 'allIncome') {

                groupCondition = `userId == "${userId}" && billType == "income" && billTime in ${JSON.stringify(billTimeArray)}`;

            }

            // 获取每天的金额统计
            return db.collection('bill')
                .where(groupCondition)
                .groupBy('billTime')
                .groupField('sum(incomeAmount) as totalIncome, sum(expensesAmount) as totalExpenses')
                .orderBy('billTime desc')
                .get();

        }).then(({ result: { data } }) => {

            let result = [];

            _.each(data, (item) => {

                result.push({
                    billTime: item.billTime,
                    billList: _.filter(billList, billItem => billItem.billTime === item.billTime),
                    totalExpenses: item.totalExpenses,
                    totalIncome: item.totalIncome,
                });

            });

            return result;

        });

};

export const getBillStatistics = ({
    userId,
    tagId,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let condition = `userId == "${userId}" && tagId == "${tagId}" && billTime >="${startTime}" && billTime < "${endTime}"`;

    if (tagId === 'all') {

        condition = `userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}"`;

    } else if (tagId === 'allExpenses') {

        condition = `userId == "${userId}" && billType == "expenses" && billTime >="${startTime}" && billTime < "${endTime}"`;

    } else if (tagId === 'allIncome') {

        condition = `userId == "${userId}" && billType == "income" && billTime >="${startTime}" && billTime < "${endTime}"`;

    }

    return db.collection('bill')
        .where(condition)
        .groupBy('null')
        .groupField('sum(incomeAmount) as totalIncome, sum(expensesAmount) as totalExpenses')
        .get()
        .then(({ result: { data } }) => {

            return data[0];

        });

};

export const getBillStatisticsGroupByTag = ({
    billType,
    userId,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let query = null;

    if (billType === 'expenses') {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && expensesAmount > 0`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .groupBy('tagId')
            .groupField('sum(expensesAmount) as amount, count(*) as totalCount')
            .orderBy('amount desc')
            .get();

    } else {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && incomeAmount > 0`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .groupBy('tagId')
            .groupField('sum(incomeAmount) as amount, count(*) as totalCount')
            .orderBy('amount desc')
            .get();

    }

    return query.then(({ result }) => {

        return result;

    });

};

export const getBillStatisticsGroupByDay = ({
    billType,
    userId,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let query = null;

    if (billType === 'expenses') {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && expensesAmount > 0`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .field('expensesAmount, billTime as day')
            .groupBy('day')
            .groupField('sum(expensesAmount) as amount')
            .orderBy('day')
            .get();

    } else {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && incomeAmount > 0`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .field('incomeAmount, billTime as day')
            .groupBy('day')
            .groupField('sum(incomeAmount) as amount')
            .orderBy('day')
            .get();

    }

    return query.then(({ result }) => {

        let _data = _.map(result.data, item => {

            item.day = parseInt(moment(item.day).format('D'));

            return item;

        });

        let selectMonth = moment(startTime).month() + 1;

        let nowMonth = moment().month() + 1;

        let date = 0;

        if (selectMonth === nowMonth) {

            date = moment().date();

        } else {

            date = moment(startTime).endOf('month').date();

        }

        let data = [];

        for (let i = 1; i <= date; i++) {

            let dataItem = {
                time: selectMonth + '.' + i,
                amount: 0
            };

            if (_.filter(_data, { 'day': i }).length > 0) {

                dataItem.amount = _.filter(_data, { 'day': i })[0].amount;

            }

            data.push(dataItem);

        }

        return {
            data
        };

    });

};

export const getBillStatisticsGroupByMonth = ({
    billType,
    userId,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let query = null;

    if (billType === 'expenses') {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && expensesAmount > 0`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .field('expensesAmount, substr(billTime,0,7) as month')
            .groupBy('month')
            .groupField('sum(expensesAmount) as amount')
            .orderBy('month')
            .get();

    } else {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && incomeAmount > 0`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .field('incomeAmount, substr(billTime,0,7) as month')
            .groupBy('month')
            .groupField('sum(incomeAmount) as amount')
            .orderBy('month')
            .get();

    }

    return query.then(({ result }) => {

        let _data = _.map(result.data, item => {

            item.month = parseInt(moment(item.month).format('M'));

            return item;

        });

        let month = moment().month() + 1;

        let data = [];

        for (let i = 6; i <= month; i++) {

            let dataItem = {
                time: i + '月',
                amount: 0
            };

            if (_.filter(_data, { 'month': i }).length > 0) {

                dataItem.amount = _.filter(_data, { 'month': i })[0].amount;

            }

            data.push(dataItem);

        }

        return {
            data
        };

    });

};

export const getBillListOrderByAmount = ({
    billType,
    userId,
    pageNumber,
    pageSize,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let query = null;

    if (billType === 'expenses') {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && expensesAmount > 0`)
            .skip(pageNumber * pageSize)
            .limit(pageSize)
            .getTemp();

        query = db.collection(bill, 'tag')
            .orderBy('expensesAmount desc')
            .get();

    } else {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && incomeAmount > 0`)
            .skip(pageNumber * pageSize)
            .limit(pageSize)
            .getTemp();

        query = db.collection(bill, 'tag')
            .orderBy('incomeAmount desc')
            .get();

    }

    return query.then(({ result }) => {

        return result;

    });

};

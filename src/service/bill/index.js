import _ from 'lodash';
import moment from 'moment';
import { BillTypeEnum, ListTypeEnum } from '@/enums';

export const getBillByBillId = ({
    billId
}) => {

    const db = uniCloud.database();

    const bill = db.collection('bill')
        .where(`_id == "${billId}"`)
        .getTemp();

    return db.collection(bill, 'tag')
        .get()
        .then(({ result: { data } }) => {

            return data && data.length === 1 ? data[0] : null;

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
        .then(({ result: { total } }) => {

            return total;

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

export const getBillRecord = ({
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

        condition = `userId == "${userId}" && billType == "${BillTypeEnum.EXPENSES}" && billTime >="${startTime}" && billTime < "${endTime}"`;

    } else if (tagId === 'allIncome') {

        condition = `userId == "${userId}" && billType == "${BillTypeEnum.INCOME}" && billTime >="${startTime}" && billTime < "${endTime}"`;

    }

    const bill = db.collection('bill')
        .where(condition)
        .orderBy('billTime desc, createTime desc')
        .skip(pageNumber * pageSize)
        .limit(pageSize)
        .getTemp();

    // 获取账单列表
    return db.collection(bill, 'tag')
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

                groupCondition = `userId == "${userId}" && billType == "${BillTypeEnum.EXPENSES}" && billTime in ${JSON.stringify(billTimeArray)}`;

            } else if (tagId === 'allIncome') {

                groupCondition = `userId == "${userId}" && billType == "${BillTypeEnum.INCOME}" && billTime in ${JSON.stringify(billTimeArray)}`;

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

        condition = `userId == "${userId}" && billType == "${BillTypeEnum.EXPENSES}" && billTime >="${startTime}" && billTime < "${endTime}"`;

    } else if (tagId === 'allIncome') {

        condition = `userId == "${userId}" && billType == "${BillTypeEnum.INCOME}" && billTime >="${startTime}" && billTime < "${endTime}"`;

    }

    return db.collection('bill')
        .where(condition)
        .groupBy('null')
        .groupField('sum(incomeAmount) as totalIncome, sum(expensesAmount) as totalExpenses')
        .get()
        .then(({ result: { data } }) => {

            if (data.length > 0) {

                return data[0];

            }
            else {

                return {
                    totalExpenses: 0,
                    totalIncome: 0
                };

            }

        });

};

export const getBillStatisticsAndTotal = ({
    userId,
    billType,
    tagId,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let query = null;

    let condition = `userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}"`;

    if (tagId) {

        condition += ` && tagId == "${tagId}"`;

    }

    if (billType === BillTypeEnum.EXPENSES) {

        query = db.collection('bill')
            .where(condition)
            .groupBy('null')
            .groupField('sum(expensesAmount) as totalAmount, count(*) as totalCount')
            .get();

    } else {

        query = db.collection('bill')
            .where(condition)
            .groupBy('null')
            .groupField('sum(incomeAmount) as totalAmount, count(*) as totalCount')
            .get();

    }

    return query.then(({ result: { data } }) => {

        if (data.length > 0) {

            return data[0];

        }
        else {

            return {
                totalAmount: 0,
                totalCount: 0
            };

        }

    });

};

export const getBillStatisticsGroupByTag = ({
    userId,
    billType,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let query = null;

    if (billType === BillTypeEnum.EXPENSES) {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}"`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .groupBy('tagId')
            .groupField('sum(expensesAmount) as amount, count(*) as totalCount')
            .orderBy('amount desc')
            .get();

    } else {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}"`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .groupBy('tagId')
            .groupField('sum(incomeAmount) as amount, count(*) as totalCount')
            .orderBy('amount desc')
            .get();

    }

    return query.then(({ result: { data } }) => {

        let result = [];

        const maxAmount = data.length > 0 ? _.maxBy(data, 'amount').amount : 0;

        _.each(data, item => {

            let percent = Number((item.amount * 100 / maxAmount).toFixed(2));

            if (percent < 1) {

                percent = 1;

            }

            result.push({
                totalCount: item.totalCount,
                percent,
                amount: item.amount,
                tagId: item.tagId[0]._id,
                tagName: item.tagId[0].tagName,
                tagIcon: item.tagId[0].selectTagIcon
            });

        });

        return result;

    });

};

export const getBillStatisticsGroupByDay = ({
    userId,
    billType,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let query = null;

    if (billType === BillTypeEnum.EXPENSES) {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}"`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .field('expensesAmount, billTime as day')
            .groupBy('day')
            .groupField('sum(expensesAmount) as amount')
            .orderBy('day')
            .get();

    } else {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}"`)
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

        let endDay = moment(startTime).endOf('month').date();

        let data = [];

        for (let i = 1; i <= endDay; i++) {

            let theDay = _.find(_data, item => item.day === i);

            let dataItem = {
                time: selectMonth + '.' + i,
                amount: !theDay ? 0 : theDay.amount
            };

            data.push(dataItem);

        }

        return data;

    });

};

export const getBillStatisticsGroupByMonth = ({
    userId,
    billType,
    startTime,
    endTime
}) => {

    const db = uniCloud.database();

    let query = null;

    if (billType === BillTypeEnum.EXPENSES) {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}"`)
            .getTemp();

        query = db.collection(bill, 'tag')
            .field('expensesAmount, substr(billTime,0,7) as month')
            .groupBy('month')
            .groupField('sum(expensesAmount) as amount')
            .orderBy('month')
            .get();

    } else {

        const bill = db.collection('bill')
            .where(`userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}"`)
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

        let endMonth = moment(startTime).endOf('year').month() + 1;

        let data = [];

        for (let i = 1; i <= endMonth; i++) {

            let theMonth = _.find(_data, item => item.month === i);

            let dataItem = {
                time: i + '月',
                amount: !theMonth ? 0 : theMonth.amount
            };

            data.push(dataItem);

        }

        return data;

    });

};

export const getBillList = ({
    userId,
    billType,
    tagId,
    pageNumber,
    pageSize,
    startTime,
    endTime,
    type = ListTypeEnum.AMOUNT
}) => {

    const db = uniCloud.database();

    let condition = '';
    let orderBy = '';

    if (!tagId) {

        condition = `userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}"`;

    } else {

        condition = `userId == "${userId}" && billTime >="${startTime}" && billTime < "${endTime}" && billType == "${billType}" && tagId == "${tagId}"`;

    }

    if (type === ListTypeEnum.AMOUNT) {

        orderBy = billType === BillTypeEnum.EXPENSES
            ? 'expensesAmount desc, billTime desc, createTime desc'
            : 'incomeAmount desc, billTime desc, createTime desc';

    } else {

        orderBy = 'billTime desc, createTime desc';

    }

    const bill = db.collection('bill')
        .where(condition)
        .orderBy(orderBy)
        .skip(pageNumber * pageSize)
        .limit(pageSize)
        .getTemp();

    return db.collection(bill, 'tag')
        .get()
        .then(({ result: { data } }) => _.map(data, (item) => {

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

        }));

};
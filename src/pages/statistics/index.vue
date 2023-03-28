<script setup name="statistics">

import { ref, computed } from 'vue';
import { onPullDownRefresh } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { useStatisticsSetting } from '@/hooks/useStatisticsSetting';
import { dateModeEnum } from '@/constant';
import {
    getBillStatisticsAndTotal,
    getBillStatisticsGroupByTag,
    getBillStatisticsGroupByDay,
    getBillStatisticsGroupByMonth,
    getBillListOrderByAmount
} from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';
import currency from 'currency.js';

import DatePicker from '@/components/date-picker';

const {
    getRingChartOpts,
    getColumnChartOpts,
    changeColor
} = useStatisticsSetting();

// 全局数据
const {
    userId
} = useState();

// 加载
const loading = ref(true);
const billType = ref('expenses');
// 日期选择器相关
const showDatePicker = ref(false);
const activeDateMode = ref(dateModeEnum.month);
const activeDate = ref(moment().format('YYYY-MM'));
// 顶部统计
const totalAmount = ref(0);
const totalCount = ref(0);
// 圆环图
const ringChartData = ref({});
const ringChartOpts = ref({});
// 柱状图
const columnChartData = ref({});
const columnChartOpts = ref({});
// 列表相关
const billList = ref([]);
const pageNumber = ref(0);
const pageSize = ref(10);

const formatDate = computed(() => isYearMode() ? `${activeDate.value}年` : moment(activeDate.value).format('YYYY年MM月'));

const formatAmount = computed(() => (amount) => currency(amount).divide(100));

const isYearMode = () => activeDate.value.length === 4;

const getTimeRange = () => {

    let unit = activeDateMode.value === dateModeEnum.month ? 'month' : 'year';

    return {
        startTime: moment(activeDate.value).startOf(unit).format('YYYY-MM-DD'),
        endTime: moment(activeDate.value).add(1, unit).startOf(unit).format('YYYY-MM-DD')
    };

};

const onDateModeChange = ({ mode }) => activeDateMode.value = mode;

const onDatePickerOpen = () => showDatePicker.value = true;

const onDatePickerClose = () => {

    showDatePicker.value = false;

    setTimeout(() => activeDateMode.value = isYearMode() ? dateModeEnum.year : dateModeEnum.month, 300);

};

const onDateSelect = ({ date }) => {

    activeDate.value = date;

    onDatePickerClose();
    onQuery();

};

const onTabItemClick = ({ type }) => {

    billType.value = type;

    initSetting();

    onQuery();

};

const initSetting = () => {

    ringChartOpts.value = getRingChartOpts({ billType: billType.value });

    columnChartOpts.value = getColumnChartOpts({ billType: billType.value });

    changeColor({ billType: billType.value });

};

const onQuery = () => {

    uni.showLoading({ title: '加载中' });

    const {
        startTime,
        endTime
    } = getTimeRange();

    const params = {
        userId: userId.value,
        billType: billType.value,
        startTime,
        endTime
    };

    Promise.all([
        getBillStatisticsAndTotal(params),
        getBillStatisticsGroupByTag(params),
        !isYearMode() ? getBillStatisticsGroupByDay(params) : getBillStatisticsGroupByMonth(params),
        getBillListOrderByAmount(_.assign(params, {
            pageNumber: pageNumber.value,
            pageSize: pageSize.value
        }))
    ]).then(([
        totalData,
        groupByTagData,
        groupByTimeData,
        listData
    ]) => {

        // 顶部总计
        totalAmount.value = totalData.totalAmount;
        totalCount.value = totalData.totalCount;

        console.log(groupByTagData);
        console.log(groupByTimeData);
        console.log(listData);

        loading.value = false;

        uni.hideLoading();

    });

};

onMounted(() => {

    // 加入笔数

    initSetting();

    onQuery();

});

onPullDownRefresh(() => onQuery());

onShareAppMessage();

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="header"
              :class="{
                  'expenses': billType === 'expenses',
                  'income': billType === 'income'
              }">

            <view class="header-item"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onDatePickerOpen">

                <text>{{ formatDate }}</text>
                <image src='../../static/svgs/down_white.svg' lazy-load />

            </view>

            <view class="header-item">

                <view class="tab"
                      :class="{ 'expenses': billType === 'expenses' }"
                      @click="onTabItemClick({ type: 'expenses' })">支出
                </view>

                <view class="tab"
                      :class="{ 'income': billType === 'income' }"
                      @click="onTabItemClick({ type: 'income' })">收入
                </view>

            </view>

        </view>

        <view class="total"
              :class="{
                  'expenses': billType === 'expenses',
                  'income': billType === 'income'
              }">

            <view class="total-amount">

                <block v-if="billType === 'expenses'">
                    <text class="label"> {{ isYearMode() ? '年支出' : '月支出' }}</text>
                    <text class="value">{{ formatAmount(totalAmount) }}</text>
                </block>

                <block v-if="billType === 'income'">
                    <text class="label">{{ isYearMode() ? '年收入' : '月收入' }}</text>
                    <text class="value">{{ formatAmount(totalAmount) }}</text>
                </block>

            </view>

            <view class="total-count">{{ totalCount }}笔</view>

        </view>

        <date-picker :show="showDatePicker"
                     :active-mode="activeDateMode"
                     :active-date="activeDate"
                     @change="onDateModeChange"
                     @select="onDateSelect"
                     @close="onDatePickerClose" />

    </view>
</template>

<style>
page {
    background-color: #ffffff;
}
</style>
  
<style lang="scss" scoped>
.content {

    .header {
        position: fixed;
        z-index: 30;
        width: 100%;
        top: 0;
        left: 0;
        color: #ffffff;
        height: 80rpx;
        padding: 0 40rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &.expenses {
            background: $canbin-expenses-color;
        }

        &.income {
            background: $canbin-income-color;
        }

        &-item {
            display: flex;
            align-items: center;

            text {
                font-size: 34rpx;
                margin-right: 5rpx;
            }

            image {
                width: 32rpx;
                height: 32rpx;
            }

            .tab {
                margin-left: 30rpx;
                padding: 10rpx 20rpx;
                color: #ffffff;
                border-radius: 3px;

                &.expenses {
                    background: #54c486;
                }

                &.income {
                    background: #f1c73d;
                }

            }

        }

    }

    .total {
        height: 160rpx;
        display: flex;
        align-items: center;
        padding: 80rpx 40rpx 0;
        color: #fff;

        &.expenses {
            background: $canbin-expenses-color;
        }

        &.income {
            background: $canbin-income-color;
        }

        &-amount {
            display: flex;
            align-items: center;

            .label {
                font-size: 30rpx;
            }

            .value {
                font-size: 50rpx;
                margin-left: 20rpx;
            }

        }

        &-count {
            font-size: 30rpx;
            margin-left: 20rpx;
            opacity: 0.7;
        }

    }

}
</style>
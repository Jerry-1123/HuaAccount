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
const ringChartList = ref([]);
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

    initSetting();

    onQuery();

};

const onTabItemClick = ({ type }) => {

    billType.value = type;

    initSetting();

    onQuery();

};

const initSetting = () => {

    ringChartOpts.value = getRingChartOpts({ billType: billType.value });

    columnChartOpts.value = getColumnChartOpts({ billType: billType.value, isYearMode: isYearMode() });

    changeColor({ billType: billType.value });

};

const onQuery = () => {

    uni.showLoading({ title: '加载中' });

    loading.value = true;

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

        // 圆环图
        ringChartData.value = {
            series: [
                {
                    data: _.map((groupByTagData), item => {

                        return {
                            name: item.tagId[0].tagName,
                            value: currency(item.amount).divide(100).value
                        };

                    }),
                    format: "customPieData"
                }
            ]
        };

        // 分类列表
        ringChartList.value = groupByTagData;

        // 柱状图
        columnChartData.value = {
            categories: _.map((groupByTimeData), item => item.time),
            series: [
                {
                    data: _.map((groupByTimeData), item => {

                        let time = isYearMode()
                            ? item.time
                            : `${item.time.split('.')[0]}月${item.time.split('.')[1]}日`;

                        return {
                            name: `${time}共${billType.value === 'expenses' ? '支出' : '收入'}: ¥${currency(item.amount).divide(100).value}`,
                            value: currency(item.amount).divide(100).value
                        };

                    }),
                }
            ]
        };

        // 列表数据
        billList.value = listData;

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
    <view class="content">

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
                <image src='../../static/svgs/icon_down_white.svg' />

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

            <view class="total-count">共{{ totalCount }}笔</view>

        </view>

        <view v-if="billList.length > 0 && !loading">

            <view class="structure">

                <view class="title">{{ billType === 'expenses' ? '支出' : '收入' }}构成</view>

                <view class="chart">

                    <qiun-data-charts type="ring"
                                      :canvas2d="true"
                                      :tooltip-show="false"
                                      :opts="ringChartOpts"
                                      :chart-data="ringChartData" />

                </view>

            </view>

            <view class="divider" />

            <view class="structure">

                <view class="title">每{{ isYearMode() ? '月' : '日' }}对比</view>

                <view class="chart">

                    <qiun-data-charts type="column"
                                      :canvas2d="true"
                                      :tooltip-show="true"
                                      :ontouch="true"
                                      :onmovetip="true"
                                      tooltipFormat="customToolTip"
                                      :opts="columnChartOpts"
                                      :chart-data="columnChartData" />

                </view>

            </view>

            <view class="divider" />

            <view class="list">

                <view v-for="item in ringChartList"
                      :key="item.tagId[0]._id"
                      class="list-item"
                      hover-class="select-hover"
                      hover-stay-time="100">

                    <view class="icon"
                          :class="{
                              'expenses': billType === 'expenses',
                              'income': billType === 'income'
                          }">

                        <image :src="item.tagId[0].selectTagIcon" />

                    </view>

                    <view class="wrap">

                        <view class="wrap-top">

                            <view class="tag-name">{{ item.tagId[0].tagName }}</view>

                            <view class="total-count">{{ item.totalCount }}笔</view>

                        </view>

                        <view class="wrap-bottom">

                            <van-progress :percentage="item.percent"
                                          :show-pivot="false"
                                          :color="billType === 'expenses' ? '#3eb575' : '#f0b73a'"
                                          stroke-width="5"
                                          track-color="#ffffff" />

                        </view>

                    </view>

                    <view class="amount">

                        <text>{{ billType === 'expenses' ? '-' : '+' }}</text>

                        <text>{{ item.amount }}</text>

                        <image src="../../static/svgs/icon_right_gray.svg" />

                    </view>

                </view>

            </view>

        </view>

        <view class="no-data" v-if="billList.length === 0 && !loading">

            <image v-show="billType === 'expenses'" src="../../static/svgs/pic_no_more.svg" />

            <image v-show="billType === 'income'" src="../../static/svgs/pic_no_more_income.svg" />

            <text>暂无账单，快去记一笔吧^-^</text>

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
    padding-top: 160rpx;

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
        position: fixed;
        z-index: 30;
        width: 100%;
        top: 80rpx;
        left: 0;
        height: 80rpx;
        display: flex;
        align-items: center;
        padding: 0 40rpx;
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
                margin-bottom: 10rpx;
            }

        }

        &-count {
            font-size: 28rpx;
            margin-left: 20rpx;
            opacity: 0.7;
        }

    }

    .structure {
        margin-top: 40rpx;
        margin-bottom: 10rpx;

        .title {
            font-size: 32rpx;
            margin-left: 40rpx;
        }

        .chart {
            padding: 20rpx 0;
            height: 450rpx;
        }

    }

    .list {
        padding: 20rpx 40rpx;

        .list-item {
            display: flex;
            align-items: center;
            margin: 15rpx 0;

            .icon {
                flex-shrink: 0;
                width: 70rpx;
                height: 70rpx;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f7f7f7;
                margin: 10rpx 0;

                image {
                    width: 35rpx;
                    height: 35rpx;
                }

                &.expenses {
                    background: $canbin-expenses-color;
                }

                &.income {
                    background: $canbin-income-color;
                }

            }

            .wrap {
                flex-grow: 1;
                margin: 0 30rpx;

                .wrap-top {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5rpx;

                    .tag-name {
                        font-size: 26rpx;
                    }

                    .total-count {
                        font-size: 22rpx;
                        color: #8e8e8e;
                        margin-left: 20rpx;
                    }

                }

                .wrap-bottom {}

            }

            .amount {
                font-size: 30rpx;
                flex-shrink: 0;
                display: flex;
                align-items: center;

                image {
                    width: 30rpx;
                    height: 30rpx;
                    margin-left: 10rpx;
                }

            }

        }

        .expand {
            height: 44rpx;
            line-height: 44rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28rpx;
            color: #8e8e8e;

            image {
                width: 34rpx;
                height: 34rpx;
                margin-left: 10rpx;
            }

        }

    }

    .divider {
        height: 1px;
        background: #eaeaea;
        margin: 0 50rpx;
    }

    .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        image {
            width: 200rpx;
            height: 200rpx;
        }

        text {
            font-size: 30rpx;
            margin-top: 10rpx;
        }
    }

}
</style>

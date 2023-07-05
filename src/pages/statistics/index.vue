<script setup name="statistics">

import { ref, computed } from 'vue';
import { onPullDownRefresh } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { useStatisticsSetting } from '@/hooks/useStatisticsSetting';
import { DateModeEnum, BillTypeEnum } from '@/enums';
import {
    getBillStatisticsAndTotal,
    getBillStatisticsGroupByTag,
    getBillStatisticsGroupByDay,
    getBillStatisticsGroupByMonth,
    getBillList
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
const billType = ref(BillTypeEnum.EXPENSES);
// 日期选择器相关
const showDatePicker = ref(false);
const activeDateMode = ref(DateModeEnum.MONTH);
const activeDate = ref(moment().format('YYYY-MM'));
// 顶部统计
const totalAmount = ref(0);
const totalCount = ref(0);
// 圆环图
const ringChartData = ref({});
const ringChartOpts = ref({});
// 构成列表
const ringChartList = ref([]);
const showExpand = ref(true);
// 柱状图
const columnChartData = ref({});
const columnChartOpts = ref({});
// 列表相关
const billList = ref([]);
const pageNumber = ref(0);
const pageSize = ref(20);

const formatDate = computed(() => isYearMode() ? `${activeDate.value}年` : moment(activeDate.value).format('YYYY年M月'));

const formatAmount = computed(() => (amount) => currency(amount).divide(100));

const formatBillTime = computed(() => (billTime) => isYearMode() ? moment(billTime).format('YYYY年M月D日') : moment(billTime).format('M月D日'));

const isYearMode = () => activeDate.value.length === 4;

const getTimeRange = () => {

    let unit = activeDateMode.value === DateModeEnum.MONTH ? 'month' : 'year';

    return {
        startTime: moment(activeDate.value).startOf(unit).format('YYYY-MM-DD'),
        endTime: moment(activeDate.value).add(1, unit).startOf(unit).format('YYYY-MM-DD')
    };

};

const onDateModeChange = (mode) => {

    activeDateMode.value = mode;

};

const onDatePickerOpen = () => {

    showDatePicker.value = true;

};

const onDatePickerClose = () => {

    showDatePicker.value = false;

    setTimeout(() => activeDateMode.value = isYearMode() ? DateModeEnum.YEAR : DateModeEnum.MONTH, 300);

};

const onDateSelect = (date) => {

    activeDate.value = date;

    onDatePickerClose();

    initSetting();

    onQuery();

};

const onTabItemClick = (type) => {

    billType.value = type;

    initSetting();

    onQuery();

};

const onClickExpand = () => {

    showExpand.value = !showExpand.value;

};

const onTagAmountItemClick = ({ tagId, tagName }) => {

    const {
        startTime,
        endTime
    } = getTimeRange();

    uni.navigateTo({
        url: `/pages/list/index?title=${tagName}${isYearMode() ? `${activeDate.value}年` : moment(activeDate.value).format('M月')}${billType.value === BillTypeEnum.EXPENSES ? '共支出' : '共收入'}&startTime=${startTime}&endTime=${endTime}&tagId=${tagId}&billType=${billType.value}`
    });

};

const onWholeButtonClick = () => {

    const {
        startTime,
        endTime
    } = getTimeRange();

    uni.navigateTo({
        url: `/pages/list/index?title=${isYearMode() ? `${activeDate.value}年` : moment(activeDate.value).format('M月')}${billType.value === BillTypeEnum.EXPENSES ? '共支出' : '共收入'}&startTime=${startTime}&endTime=${endTime}&billType=${billType.value}`
    });

};

const initSetting = () => {

    ringChartOpts.value = getRingChartOpts(billType.value);
    columnChartOpts.value = getColumnChartOpts(billType.value, isYearMode());

    changeColor(billType.value);

};

const onQuery = () => {

    uni.showLoading({ title: '加载中', mask: true });

    loading.value = true;
    showExpand.value = true;

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
        getBillList(_.assign(params, {
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
                            name: item.tagName,
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
                            name: `${time}共${billType.value === BillTypeEnum.EXPENSES ? '支出' : '收入'}: ¥${currency(item.amount).divide(100).value}`,
                            value: currency(item.amount).divide(100).value
                        };

                    })
                }
            ]
        };

        // 列表数据
        billList.value = listData;

        loading.value = false;

        uni.hideLoading();
        uni.stopPullDownRefresh();

    });

};

onMounted(() => {

    initSetting();

    onQuery();

});

onPullDownRefresh(() => {

    onQuery();

});

onShareAppMessage();

</script>

<template>
    <view class="content">

        <view class="header"
              :class="{
                  'expenses': billType === BillTypeEnum.EXPENSES,
                  'income': billType === BillTypeEnum.INCOME
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
                      :class="{ 'expenses': billType === BillTypeEnum.EXPENSES }"
                      @click="onTabItemClick(BillTypeEnum.EXPENSES)">支出
                </view>

                <view class="tab"
                      :class="{ 'income': billType === BillTypeEnum.INCOME }"
                      @click="onTabItemClick(BillTypeEnum.INCOME)">收入
                </view>

            </view>

        </view>

        <view class="total"
              :class="{
                  'expenses': billType === BillTypeEnum.EXPENSES,
                  'income': billType === BillTypeEnum.INCOME
              }">

            <view class="total-amount">

                <block v-if="billType === BillTypeEnum.EXPENSES">
                    <text class="label"> {{ isYearMode() ? '年支出' : '月支出' }}</text>
                    <text class="value">{{ formatAmount(totalAmount) }}</text>
                </block>

                <block v-if="billType === BillTypeEnum.INCOME">
                    <text class="label">{{ isYearMode() ? '年收入' : '月收入' }}</text>
                    <text class="value">{{ formatAmount(totalAmount) }}</text>
                </block>

            </view>

            <view class="total-count">共{{ totalCount }}笔</view>

        </view>

        <view v-if="billList.length > 0 && !loading">

            <view class="structure">

                <view class="title">{{ billType === BillTypeEnum.EXPENSES ? '支出' : '收入' }}构成</view>

                <view class="chart">

                    <qiun-data-charts type="ring"
                                      :canvas2d="true"
                                      :tooltip-show="false"
                                      :opts="ringChartOpts"
                                      :chart-data="ringChartData" />

                </view>

                <view class="ring-chart-list">

                    <view v-for="item in (showExpand ? ringChartList.slice(0, 5) : ringChartList)"
                          :key="item.tagId"
                          class="list-item"
                          hover-class="default-hover-class"
                          hover-stay-time="100"
                          @click="onTagAmountItemClick(item)">

                        <view class="icon"
                              :class="{
                                  'expenses': billType === BillTypeEnum.EXPENSES,
                                  'income': billType === BillTypeEnum.INCOME
                              }">
                            <image :src="item.tagIcon" />
                        </view>

                        <view class="wrap">

                            <view class="wrap-top">

                                <view class="tag-name">{{ item.tagName }}</view>
                                <view class="total-count">{{ item.totalCount }}笔</view>

                            </view>

                            <view class="wrap-bottom">

                                <van-progress :percentage="item.percent"
                                              :show-pivot="false"
                                              :color="billType === BillTypeEnum.EXPENSES ? '#3eb575' : '#f0b73a'"
                                              stroke-width="5"
                                              track-color="#ffffff" />

                            </view>

                        </view>

                        <view class="amount">

                            <text>{{ billType === BillTypeEnum.EXPENSES ? '-' : '+' }}</text>
                            <text>{{ formatAmount(item.amount) }}</text>
                            <image src="../../static/svgs/icon_right_gray.svg" />

                        </view>

                    </view>

                    <view v-if="ringChartList.length > 5">

                        <view v-if="showExpand"
                              class="expand"
                              hover-class="default-hover-class"
                              hover-stay-time="100"
                              @click="onClickExpand">

                            展开更多

                            <image src="../../static/svgs/icon_down_gray.svg" />

                        </view>

                        <view v-if="!showExpand"
                              class="expand"
                              hover-class="default-hover-class"
                              hover-stay-time="100"
                              @click="onClickExpand">

                            收起

                            <image src="../../static/svgs/icon_up_gray.svg" />

                        </view>

                    </view>

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

            <view class="structure">

                <view class="title">

                    {{ billType === BillTypeEnum.EXPENSES ? '支出' : '收入' }}排行

                </view>

                <view class="list">

                    <view v-for="(bill, index) in billList.slice(0, 10)"
                          :key="bill._id"
                          class="list-item"
                          hover-class="gray-hover-class"
                          hover-stay-time="100">

                        <view class="index">{{ index + 1 }}</view>

                        <view class="icon"
                              :class="{
                                  'expenses': bill.billType === BillTypeEnum.EXPENSES,
                                  'income': bill.billType === BillTypeEnum.INCOME
                              }">

                            <image :src="bill.tagIcon" />

                        </view>

                        <view class="item-content">

                            <view class="tag-name">{{ bill.tagName }}</view>
                            <view class="remark">{{ bill.remark }}</view>

                        </view>

                        <view class="info">

                            <view v-if="bill.billType === BillTypeEnum.EXPENSES" class="amount">
                                - {{ formatAmount(bill.expensesAmount) }}
                            </view>
                            <view v-if="bill.billType === BillTypeEnum.INCOME" class="amount">
                                + {{ formatAmount(bill.incomeAmount) }}
                            </view>

                            <view class="bill-time">{{ formatBillTime(bill.billTime) }}</view>

                        </view>

                    </view>

                </view>

                <view v-if="billList.length > 10"
                      class="whole"
                      hover-class="default-hover-class"
                      hover-stay-time="100"
                      @click="onWholeButtonClick">

                    全部排行
                    <image src="../../static/svgs/icon_right_gray.svg" />

                </view>

            </view>

        </view>

        <view class="no-data" v-if="billList.length === 0 && !loading">

            <image v-show="billType === BillTypeEnum.EXPENSES" src="../../static/svgs/pic_no_more.svg" />

            <image v-show="billType === BillTypeEnum.INCOME" src="../../static/svgs/pic_no_more_income.svg" />

            <text>暂无账单，快去记一笔吧^-^</text>

        </view>

        <date-picker :visible="showDatePicker"
                     :active-mode="activeDateMode"
                     :active-date="activeDate"
                     @change="onDateModeChange"
                     @select="onDateSelect"
                     @close="onDatePickerClose" />

        <!-- 用于解决ios的bug -->
        <view style="height: 1px" />

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>

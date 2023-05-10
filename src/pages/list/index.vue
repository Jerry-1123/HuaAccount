<script setup name="list">

import { ref, computed } from 'vue';
import { onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { defaultPageSize, listTypeEnum, billTypeEnum } from '@/constant';
import { getBillList, getBillStatisticsAndTotal } from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';
import currency from 'currency.js';

// 全局数据
const {
    userId
} = useState();

const startTime = ref('');
const endTime = ref('');
const tagId = ref('');
const billType = ref('');
const isYear = ref(false);
// 加载
const loading = ref(true);
// 类型(按金额分类/按时间分类)
const activeListType = ref(listTypeEnum.amount);
// 列表相关
const pageNumber = ref(0);
const pageSize = ref(defaultPageSize);
const pageStatus = ref('');
const list = ref([]);
// 统计
const totalAmount = ref(0);
const totalCount = ref(0);

const formatAmount = computed(() => (amount) => currency(amount).divide(100));

const formatBillTime = computed(() => (billTime) => isYear.value ? moment(billTime).format('YYYY年M月D日') : moment(billTime).format('M月D日'));

const onTabItemClick = ({ listType }) => {

    activeListType.value = listType;

    onClear();

};

const onQuery = () => {

    if (pageStatus.value === 'noMore') {

        return;

    }

    pageStatus.value = 'loading';

    getBillList({
        userId: userId.value,
        billType: billType.value,
        tagId: tagId.value,
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
        startTime: startTime.value,
        endTime: endTime.value,
        type: activeListType.value
    }).then((data) => {

        if (data.length < pageSize.value) {

            pageStatus.value = 'noMore';

        }

        if (pageNumber.value === 0) {

            list.value = data;

        } else {

            list.value = _.concat(
                list.value,
                data
            );

        }

        uni.hideLoading();
        uni.stopPullDownRefresh();

    });

};

const onClear = () => {

    pageStatus.value = '';
    pageNumber.value = 0;

    uni.showLoading();

    onQuery();

};

const onQueryStatistics = () => {

    getBillStatisticsAndTotal({
        userId: userId.value,
        billType: billType.value,
        tagId: tagId.value,
        startTime: startTime.value,
        endTime: endTime.value
    }).then((data) => {

        totalAmount.value = currency(data.totalAmount).divide(100);
        totalCount.value = data.totalCount;

    });

};

onMounted(({
    title: _title,
    startTime: _startTime,
    endTime: _endTime,
    tagId: _tagId,
    billType: _billType
}) => {

    uni.setNavigationBarTitle({
        title: _title
    });

    startTime.value = _startTime;
    endTime.value = _endTime;
    tagId.value = _tagId;
    billType.value = _billType;
    isYear.value = _title.includes('年');

    onQuery();

    onQueryStatistics();

});

onPullDownRefresh(() => onClear());

onReachBottom(() => {

    if (pageStatus.value === 'noMore') {

        return;

    }

    pageNumber.value++;

    onQuery();

});

onShareAppMessage();

</script>

<template>
    <view class="content">

        <view class="action-content">

            <view class="tab">

                <view class="tab-item"
                      :class="{
                          'expenses': activeListType === listTypeEnum.amount && billType === billTypeEnum.expenses,
                          'income': activeListType === listTypeEnum.amount && billType === billTypeEnum.income
                      }"
                      :hover-class="activeListType === listTypeEnum.amount ? '' : 'gray-hover-class'"
                      hover-stay-time="100"
                      @click="onTabItemClick({ listType: listTypeEnum.amount })">金额
                </view>

                <view class="tab-item"
                      :class="{
                          'expenses': activeListType === listTypeEnum.time && billType === billTypeEnum.expenses,
                          'income': activeListType === listTypeEnum.time && billType === billTypeEnum.income
                      }"
                      :hover-class="activeListType === listTypeEnum.time ? '' : 'gray-hover-class'"
                      hover-stay-time="100"
                      @click="onTabItemClick({ listType: listTypeEnum.time })">时间
                </view>

            </view>

            <view class="total">

                {{ billType === billTypeEnum.expenses ? '共支出' : '共收入' }}{{ totalAmount }}

            </view>

        </view>

        <view class="list">

            <view v-for="(bill) in list"
                  :key="bill._id"
                  class="list-item"
                  hover-class="default-hover-class"
                  hover-stay-time="100">

                <view class="icon"
                      :class="{
                          'expenses': bill.billType === billTypeEnum.expenses,
                          'income': bill.billType === billTypeEnum.income
                      }">

                    <image :src="bill.tagIcon" />

                </view>

                <view class="item-content">

                    <view class="tag-name">{{ bill.tagName }}</view>
                    <view class="remark">{{ bill.remark }}</view>

                </view>

                <view class="info">

                    <view v-if="bill.billType === billTypeEnum.expenses" class="amount">
                        - {{ formatAmount(bill.expensesAmount) }}
                    </view>
                    <view v-if="bill.billType === billTypeEnum.income" class="amount">
                        + {{ formatAmount(bill.incomeAmount) }}
                    </view>

                    <view class="bill-time">{{ formatBillTime(bill.billTime) }}</view>

                </view>

            </view>

        </view>

        <view class="loading-content">

            <van-loading v-show="pageStatus === 'loading'" size="30rpx" type="spinner">正在加载...</van-loading>
            <van-loading v-show="pageStatus === 'noMore'" size="30px" type="">没有更多数据了，快去记一笔吧^-^</van-loading>

        </view>

        <!-- 用于解决ios的bug -->
        <view style="height: 1px" />

    </view>
</template>

<style>
page {
    background-color: #ffffff;
}
</style>

<style lang="scss" scoped>
.content {
    margin-bottom: 40rpx;

    .action-content {
        flex-shrink: 0;
        padding: 50rpx 50rpx 30rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 34rpx;

        .tab {
            display: flex;

            &-item {
                margin-right: 30rpx;
                padding: 10rpx 20rpx;
                color: #acabab;
                background: #f7f7f7;
                border-radius: 4px;

                &.expenses {
                    background: #eef8f3;
                    color: $canbin-expenses-color;
                }

                &.income {
                    background: #fff5e1;
                    color: $canbin-income-color;
                }

            }

        }

        .total {
            font-size: 30rpx;
            font-weight: bold;
            max-width: 350rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

    }

    .list {
        padding: 30rpx;

        .list-item {
            display: flex;
            align-items: center;
            padding: 25rpx;
            border-bottom: 1px solid #ececec;

            .icon {
                width: 70rpx;
                height: 70rpx;
                border-radius: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;

                &.expenses {
                    background: $canbin-expenses-color;
                }

                &.income {
                    background: $canbin-income-color;
                }

                image {
                    width: 45rpx;
                    height: 45rpx;
                }

            }

            .item-content {
                flex-grow: 1;
                margin-left: 25rpx;

                .tag-name {
                    font-size: 28rpx;
                    margin-bottom: 5rpx;
                }

                .remark {
                    font-size: 24rpx;
                    color: #7e7e7e;
                }

            }

            .info {
                flex-shrink: 0;
                margin-left: 10rpx;

                .amount {
                    font-size: 30rpx;
                    font-weight: bold;
                    text-align: right;
                    margin-bottom: 5rpx;
                }

                .bill-time {
                    font-size: 24rpx;
                    color: #7e7e7e;
                    text-align: right;
                }

            }

        }

    }

    .loading-content {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30rpx;
    }

}
</style>

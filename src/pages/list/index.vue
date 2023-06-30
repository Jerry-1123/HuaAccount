<script setup name="list">

import { ref, computed } from 'vue';
import { onPullDownRefresh, onReachBottom, onPageScroll } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { defaultPageSize } from '@/constant';
import { ListTypeEnum, BillTypeEnum, PageStatusEnum } from '@/enums';
import { getBillList, getBillStatisticsAndTotal } from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';
import currency from 'currency.js';

import BackToTop from '@/components/back-to-top';

// 全局数据
const {
    userId
} = useState();

// 条件
const startTime = ref('');
const endTime = ref('');
const tagId = ref('');
const billType = ref('');
const isYear = ref(false);
// 加载
const loading = ref(true);
// 类型(按金额分类/按时间分类)
const activeListType = ref(ListTypeEnum.AMOUNT);
// 列表相关
const pageNumber = ref(0);
const pageSize = ref(defaultPageSize);
const pageStatus = ref('');
const list = ref([]);
// 统计
const totalAmount = ref(0);
const totalCount = ref(0);
// 显示返回顶部
const showBackToTop = ref(false);

const formatAmount = computed(() => (amount) => currency(amount).divide(100));

const formatBillTime = computed(() => (billTime) => isYear.value ? moment(billTime).format('YYYY年M月D日') : moment(billTime).format('M月D日'));

const onTabItemClick = (listType) => {

    activeListType.value = listType;

    onClear();

};

const onQuery = () => {

    if (pageStatus.value === PageStatusEnum.NOMORE) {

        return Promise.resolve();

    }

    pageStatus.value = PageStatusEnum.LOADING;

    return getBillList({
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

            pageStatus.value = PageStatusEnum.NOMORE;

        }

        if (pageNumber.value === 0) {

            list.value = data;

        } else {

            list.value = _.concat(
                list.value,
                data
            );

        }

    });

};

const onClear = () => {

    uni.showLoading({ title: '加载中', mask: true });

    pageStatus.value = '';
    pageNumber.value = 0;

    onQuery().then(() => {

        uni.hideLoading();
        uni.stopPullDownRefresh();

    });

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

onMounted((opts) => {

    uni.setNavigationBarTitle({
        title: opts.title
    });

    startTime.value = opts.startTime;
    endTime.value = opts.endTime;
    tagId.value = opts.tagId;
    billType.value = opts.billType;
    isYear.value = opts.title.includes('年');

    onQuery().then(() => {

        loading.value = false;

        uni.hideLoading();

    });

    onQueryStatistics();

});

onPullDownRefresh(() => {

    onClear();

});

onReachBottom(() => {

    if (pageStatus.value === PageStatusEnum.NOMORE) {

        return;

    }

    pageNumber.value++;

    onQuery();

});

onPageScroll(({ scrollTop }) => {

    showBackToTop.value = scrollTop >= (uni.getSystemInfoSync().windowHeight / 4);

});

onShareAppMessage();

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="action-content">

            <view class="tab">

                <view class="tab-item"
                      :class="{
                          'expenses': activeListType === ListTypeEnum.AMOUNT && billType === BillTypeEnum.EXPENSES,
                          'income': activeListType === ListTypeEnum.AMOUNT && billType === BillTypeEnum.INCOME
                      }"
                      hover-stay-time="100"
                      @click="onTabItemClick(ListTypeEnum.AMOUNT)">按金额
                </view>

                <view class="tab-item"
                      :class="{
                          'expenses': activeListType === ListTypeEnum.TIME && billType === BillTypeEnum.EXPENSES,
                          'income': activeListType === ListTypeEnum.TIME && billType === BillTypeEnum.INCOME
                      }"
                      hover-stay-time="100"
                      @click="onTabItemClick(ListTypeEnum.TIME)">按时间
                </view>

            </view>

            <view class="total">

                {{ billType === BillTypeEnum.EXPENSES ? '支出' : '收入' }}¥{{ totalAmount }}

            </view>

        </view>

        <view class="list">

            <view v-for="(bill) in list"
                  :key="bill._id"
                  class="list-item"
                  hover-class="gray-hover-class"
                  hover-stay-time="100">

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

        <view class="loading-content">

            <van-loading v-show="pageStatus === PageStatusEnum.LOADING" size="30rpx" type="spinner">正在加载...</van-loading>
            <van-loading v-show="pageStatus === PageStatusEnum.NOMORE" size="30px" type="">没有更多数据了，快去记一笔吧^-^</van-loading>

        </view>

        <back-to-top :visible="showBackToTop"
                     :bill-type="billType" />

        <!-- 用于解决ios的bug -->
        <view style="height: 1px" />

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>

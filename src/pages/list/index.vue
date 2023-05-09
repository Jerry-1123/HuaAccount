<script setup name="list">

import { ref, computed } from 'vue';
import { onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { defaultPageSize, listTypeEnum } from '@/constant';
import { getBillList, getBillStatisticsAndTotal } from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';

// 全局数据
const {
    userId
} = useState();

// 加载
const loading = ref(true);
const startTime = ref('');
const endTime = ref('');
const tagId = ref('');
const billType = ref('');
// 类型(按金额分类/按时间分类)
const listType = ref(listTypeEnum.amount);
// 列表相关
const pageNumber = ref(0);
const pageSize = ref(defaultPageSize);
const pageStatus = ref('');
const list = ref([]);
// 统计
const totalAmount = ref(0);
const totalCount = ref(0);

// const formatAmount = computed(() => (amount) => currency(amount).divide(100));

// const formatBillTime = computed(() => (billTime) => isYearMode() ? moment(billTime).format('YYYY年M月D日') : moment(billTime).format('M月D日'));

// const isYearMode = () => activeDate.value.length === 4;

const onQuery = () => {

    getBillList({
        userId: userId.value,
        billType: billType.value,
        tagId: tagId.value,
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
        startTime: startTime.value,
        endTime: endTime.value,
        type: listType.value
    }).then((data) => {

        list.value = data;

        uni.hideLoading();

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

        totalAmount.value = data.totalAmount;
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

    onQuery();

    onQueryStatistics();

});

onPullDownRefresh(() => {

});

onReachBottom(() => {

});

onShareAppMessage();

</script>

<template>
    <view class="content">

        <view class="list">

            <!-- <view v-for="(bill, index) in list"
                  :key="bill._id"
                  class="list-item"
                  hover-class="default-hover-class"
                  hover-stay-time="100">

                <view class="index">{{ index + 1 }}</view>

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

            </view> -->

        </view>

    </view>
</template>

<style>
page {
    background-color: #ffffff;
}
</style>

<style lang="scss" scoped>
.content {}
</style>

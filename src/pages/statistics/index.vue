<script setup name="statistics">

import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import {
    onLoad,
    onPullDownRefresh,
    onShareAppMessage
} from "@dcloudio/uni-app";
import { checkForPageLoad } from '@/common';
import {
    getBillStatistics,
    getBillStatisticsGroupByTag,
    getBillStatisticsGroupByDay,
    getBillStatisticsGroupByMonth,
    getBillListOrderByAmount
} from '@/service/bill';
import moment from 'moment';
import _ from 'lodash-es';

import DatePicker from '@/components/date-picker';

const userStore = useUserStore();
const appStore = useAppStore();

// 用户信息
const {
    userId
} = storeToRefs(userStore);
// 应用信息
const {
    shareData
} = storeToRefs(appStore);

// 加载
const loading = ref(true);
// 日期选择器相关
const showDatePicker = ref(false);
const activeDateMode = ref(dateModeEnum.month);
const activeDate = ref(moment().format('YYYY-MM'));

onLoad(() => { });

onShareAppMessage(() => shareData.value);

</script>

<template>
    <view v-show="!loading" class="content">

    </view>
</template>

<style>
page {
    background-color: #ffffff;
}
</style>
  
<style lang="scss" scoped>
.chart {
    padding: 20rpx 0;
    width: 100%;
    height: 450rpx;
}
</style>
<script setup name="statistics">

import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { onLoad, onPullDownRefresh, onShareAppMessage } from "@dcloudio/uni-app";
import { checkForPageLoad } from '@/common';
import { dateModeEnum } from '@/constant';
import {
    getBillStatistics,
    getBillStatisticsGroupByTag,
    getBillStatisticsGroupByDay,
    getBillStatisticsGroupByMonth,
    getBillListOrderByAmount
} from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';
import currency from 'currency.js';

import DatePicker from '@/components/date-picker';
import LineChart from './line-chart';
import PieChart from './pie-chart';
import Progress from './progress';

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

const onQuery = () => {

};

onLoad(() => {

    // 加入笔数

    uni.showLoading({ title: '加载中' });

    checkForPageLoad().then(() => {

        loading.value = false;

        setTimeout(() => uni.hideLoading(), 500);

    });

});

onPullDownRefresh(() => {



});

onShareAppMessage(() => shareData.value);

</script>

<template>
    <view v-show="!loading" class="content">
        <view style="margin-top: 40rpx;text-align: center;">
            正在开发中，敬请期待^-^
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
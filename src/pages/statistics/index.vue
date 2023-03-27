<script setup name="statistics">

import { ref, computed } from 'vue';
import { onPullDownRefresh } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { useShare } from '@/hooks/useShare';
import { useState } from '@/hooks/useState';
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

// 页面分享
const { onShareAppMessage } = useShare();

// 全局数据
const {
    userId
} = useState();

// 加载
const loading = ref(true);
// 日期选择器相关
const showDatePicker = ref(false);
const activeDateMode = ref(dateModeEnum.month);
const activeDate = ref(moment().format('YYYY-MM'));

const onQuery = () => {

};

onMounted(() => {

    // 加入笔数

    loading.value = false;

    setTimeout(() => uni.hideLoading(), 500);

});

onPullDownRefresh(() => {



});

onShareAppMessage();

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
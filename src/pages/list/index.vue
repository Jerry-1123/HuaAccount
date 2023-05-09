<script setup name="list">

import { ref, computed } from 'vue';
import { onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { defaultPageSize } from '@/constant';
import { getBillListByTag, getBillStatistics, deleteBill } from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';

// 加载
const loading = ref(true);
// 类型(按标签分类/按周期分类)
const listType = ref('');
// 列表相关
const pageNumber = ref(0);
const pageSize = ref(defaultPageSize);
const pageStatus = ref('');
const list = ref([]);

const onQuery = () => {



};

onMounted(({ title, date, tagId }) => {

    uni.setNavigationBarTitle({
        title
    });

    console.log(date, tagId);

    uni.hideLoading();

});

onPullDownRefresh(() => {

});

onReachBottom(() => {

});

onShareAppMessage();

</script>

<template>
    <view class="content">

        <view style="margin: 40rpx;text-align: center;font-size: 28rpx;">正在开发中，敬请期待...</view>

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

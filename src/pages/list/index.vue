<script setup name="list">

import { ref, computed } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { getBillListByTag, getBillStatistics, deleteBill } from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';

onShareAppMessage();

</script>

<template>
    <view class="content">

    </view>
</template>

<style>
page {
    background-color: #ededed;
}
</style>

<style lang="scss" scoped>
.content {}
</style>

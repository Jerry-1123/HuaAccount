<script setup name="report">

import { ref } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { useState } from '@/hooks/useState';

// 加载
const loading = ref(true);

onMounted(() => {

    loading.value = false;

    uni.hideLoading();

});

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
.content {
    height: 100%;
    background-color: #fff;
    margin-top: 20rpx;
}
</style>
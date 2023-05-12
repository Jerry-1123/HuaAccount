<script setup name="user">

import { ref } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';

// 全局数据
const {
    userId
} = useState();

onMounted(() => {

    // 我的界面
    // 头像、昵称
    // 意见反馈
    // 分享
    // 关于

});

onShareAppMessage();

</script>

<template>
    <view class="content">

        

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
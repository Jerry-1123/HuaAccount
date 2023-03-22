<script setup name="user">

import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import {
    onLoad,
    onShareAppMessage
} from "@dcloudio/uni-app";
import { checkForPageLoad } from '@/common';

onLoad(() => {

    uni.showLoading({ title: '加载中' });

    checkForPageLoad().then(() => {


    });

});

onShareAppMessage(() => shareData);

</script>

<template></template>

<style></style>

<style lang="scss" scoped></style>
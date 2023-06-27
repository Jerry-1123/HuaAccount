<script setup name="user">

import { ref, computed } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { appVersion } from "@/constant";
import moment from 'moment';

// 全局数据
const {
    avatar,
    nickName,
    registerTime
} = useState();

const version = ref(appVersion);
const defaultAvatar = ref('../../static/images/icon_avatar.png');

const formatDuration = computed(() => moment(moment().valueOf()).diff(moment(registerTime.value), 'days') + 1);

const onUserInfoClick = () => {

    uni.navigateTo({
        url: '/pages/user-info/index'
    });

};

const onAboutClick = () => {

    uni.navigateTo({
        url: '/pages/about/index'
    });

};

onMounted(() => {

    uni.hideLoading();

});

onShareAppMessage();

</script>

<template>
    <view class="content">

        <view class="user-info" @click="onUserInfoClick">

            <image class="avatar" :src="avatar || defaultAvatar" />

            <view class="wrap">

                <view class="name">{{ nickName }}</view>

                <text class="time">已使用{{ formatDuration }}天</text>

            </view>

            <image class="more" src="../../static/svgs/icon_right_gray.svg" />

        </view>

        <button class="cell" open-type="feedback">

            <image class="icon" src="../../static/svgs/icon_feedback.svg" />

            <view class="label">意见反馈</view>

            <image class="more" src="../../static/svgs/icon_right_gray.svg" />

        </button>

        <view class="divider" />

        <button class="cell" open-type="share">

            <image class="icon" src="../../static/svgs/icon_share.svg" />

            <view class="label">推荐花花记账本给好友</view>

            <image class="more" src="../../static/svgs/icon_right_gray.svg" />

        </button>

        <view class="divider" />

        <button class="cell" @click="onAboutClick">

            <image class="icon" src="../../static/svgs/icon_about.svg" />

            <view class="label">关于</view>

            <image class="more" src="../../static/svgs/icon_right_gray.svg" />

        </button>

        <view class="version">版本：{{ version }}</view>

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>

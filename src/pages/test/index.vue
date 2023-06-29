<!-- 页面公共模版 -->
<script setup name="test">
</script>

<template>
    <view class="content">

        <t-swipe-cell>
            <t-cell title="左滑多操作" note="辅助信息" />
            <view slot="right" class="btn-wrapper">
                <view class="btn favor-btn" bind:tap="onFavor">收藏</view>
                <view class="btn edit-btn" bind:tap="onEdit">编辑</view>
                <view class="btn delete-btn" bind:tap="onDelete">删除</view>
            </view>
        </t-swipe-cell>

        <view>
            ----------------------------------
        </view>

        <van-swipe-cell right-width="65" left-width="65">
            <view slot="left" class="btn favor-btn">选择</view>
            <view style="height:100rpx">
                1234444
            </view>
            <view slot="right" class="btn delete-btn">删除</view>
        </van-swipe-cell>

        <view>
            ----------------------------------
        </view>

        <t-swipe-cell>
            <t-cell title="左滑多操作" note="辅助信息" />
            <view slot="right" class="btn-wrapper">
                <view class="btn favor-btn" bind:tap="onFavor">收藏</view>
                <view class="btn edit-btn" bind:tap="onEdit">编辑</view>
                <view class="btn delete-btn" bind:tap="onDelete">删除</view>
            </view>
        </t-swipe-cell>

        <view>
            ----------------------------------
        </view>

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>
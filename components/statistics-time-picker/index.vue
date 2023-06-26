<template>
    <view class="container">

        <view class="title">

            <text>{{ mode === 'month' ? '请选择月账单' : '请选择年账单' }}</text>

        </view>

        <van-tabs
            :active="mode"
            title-active-color="#3eb575"
            color="#fafafa"
            @change="onStatisticsModeChange">

            <van-tab title="月账单" name="month">

                <view class="content">

                    <view v-for="(item, key) in options"
                        :key="key">

                        <view class="year">{{ key }}年</view>

                        <view class="grid">

                            <view v-for="month in item"
                                :key="month"
                                :class="['grid-item', monthTime === month ? 'grid-item-selected' : '']"
                                hover-class="select-hover"
                                hover-stay-time="100"
                                @click="onStatisticsItemClick({ time: month })">

                                {{ monthFormat(month) }}

                            </view>

                        </view>

                    </view>

                </view>

            </van-tab>

            <van-tab title="年账单" name="year">

                <view class="content">

                    <view class="grid">

                        <view v-for="(item, key) in options"
                            :key="key"
                            :class="['grid-item', yearTime === key ? 'grid-item-selected' : '']"
                            hover-class="select-hover"
                            hover-stay-time="100"
                            @click="onStatisticsItemClick({ time: key })">

                            {{ key }}年

                        </view>

                    </view>

                </view>

            </van-tab>

        </van-tabs>

    </view>
</template>

<script>

import moment from 'moment';
import { getStatisticsTimeOptions } from '../../util';

export default {
    name: 'statistics-time-picker',
    props: {
        mode: String,
        yearTime: String,
        monthTime: String
    },
    data() {
        return {
            options: getStatisticsTimeOptions()
        };
    },
    computed: {
        monthFormat() {

            return (month) => moment(month).format('M月');

        }
    },
    methods: {
        onStatisticsModeChange({ detail: { name } }) {

            this.$emit('modeChange', { name });

        },
        onStatisticsItemClick({ time }) {

            this.$emit('itemClick', { time });

        }
    }
};
</script>
    
<style scoped lang="scss">
.container {
    height: 100%;
    background: #fafafa;

    .title {
        height: 50px;
        line-height: 50px;
        text-align: center;
    }

    .content {
        height: 280px;
        overflow-y: scroll;
        padding: 0 40rpx;

        .year {
            text-align: center;
            margin: 15rpx 0;
            color: #acabab;
            font-size: 28rpx;
        }

        .grid {
            width: 100%;
            display: flex;
            flex-wrap: wrap;

            .grid-item {
                padding: 20rpx 0;
                margin: 10rpx;
                width: 146rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffffff;
                font-size: 28rpx;
            }

            .grid-item-selected {
                color: #fff;
                background: $canbin-expenses-color;
                border-radius: 3px;
            }

        }

    }

}

.select-hover {
    opacity: 0.8;
}
</style>
<script setup name="date-picker">

import { ref } from 'vue';
import { dateModeEnum } from '@/constant';
import { getDateOptions } from '@/util';
import moment from 'moment';

const options = ref(getDateOptions());

defineProps({
    show: {
        type: Boolean,
        default: false
    },
    activeMode: {
        type: String,
        default: ''
    },
    activeDate: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['change', 'select', 'close']);

const onModeChange = ({ mode }) => emit('change', { mode });

const onDateItemClick = ({ date }) => emit('select', { date });

const onPopupClose = () => emit('close');

</script>

<template>
    <van-popup :show="show"
               :safe-area-inset-bottom="false"
               custom-style="height: 450px"
               position="bottom"
               round
               closeable
               duration="200"
               @close="onPopupClose">

        <view class="content">

            <view class="title">

                {{ activeMode === dateModeEnum.month ? '请选择月账单' : '请选择年账单' }}

            </view>

            <view class="tab">

                <view class="tab-item"
                      :class="{ active: activeMode === dateModeEnum.month }"
                      hover-class="default-hover-class"
                      hover-stay-time="100"
                      @click="onModeChange({ mode: dateModeEnum.month })"> 月账单
                </view>

                <view class="tab-item"
                      :class="{ active: activeMode === dateModeEnum.year }"
                      hover-class="default-hover-class"
                      hover-stay-time="100"
                      @click="onModeChange({ mode: dateModeEnum.year })">年账单
                </view>

            </view>

            <view v-show="activeMode === dateModeEnum.month" class="container">

                <view v-for="(item, key) in options"
                      :key="key">

                    <view class="year">{{ key }}年</view>

                    <view class="grid">

                        <view v-for="(month) in item"
                              :key="month"
                              class="grid-item"
                              :class="{ active: activeDate === month }"
                              hover-class="default-hover-class"
                              hover-stay-time="100"
                              @click="onDateItemClick({ date: month })">

                            {{ moment(month).format('M月') }}

                        </view>

                    </view>

                </view>

            </view>

            <view v-show="activeMode === dateModeEnum.year" class="container">

                <view class="grid">

                    <view v-for="(item, year) in options"
                          :key="year"
                          class="grid-item"
                          :class="{ active: activeDate === year }"
                          hover-class="default-hover-class"
                          hover-stay-time="100"
                          @click="onDateItemClick({ date: year })">

                        {{ year }}年

                    </view>

                </view>

            </view>

        </view>

    </van-popup>
</template>   

<style lang="scss" scoped>
.content {
    background: #fafafa;

    .title {
        height: 50px;
        line-height: 50px;
        text-align: center;
    }

    .tab {
        height: 50px;
        display: flex;
        align-items: center;

        &-item {
            flex-grow: 1;
            text-align: center;

            &.active {
                color: #3eb575;
            }

        }

    }

    .container {
        height: 350px;
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
                cursor: pointer;

                &.active {
                    color: #fff;
                    background: $canbin-expenses-color;
                    border-radius: 3px;
                }

            }

        }

    }

}
</style>
<script setup name="date-picker">

import { useOptions } from '@/hooks/useOptions';
import { DateModeEnum } from '@/enums';
import moment from 'moment';

const emit = defineEmits(['change', 'select', 'close']);

const props = defineProps({
    visible: {
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

const {
    dateOptions
} = useOptions();

const onModeChange = (mode) => {

    emit('change', mode);

};

const onDateItemClick = (date) => {

    if (date !== props.activeDate) {

        emit('select', date);

    }

};

const onPopupClose = () => {

    emit('close');

};

</script>

<template>
    <van-popup :show="visible"
               :safe-area-inset-bottom="false"
               custom-style="height: 800rpx"
               position="bottom"
               round
               closeable
               duration="200"
               @close="onPopupClose">

        <view class="content">

            <view class="title">

                {{ activeMode === DateModeEnum.MONTH ? '请选择月账单' : '请选择年账单' }}

            </view>

            <view class="tab">

                <view class="tab-item"
                      :class="{ 'active': activeMode === DateModeEnum.MONTH }"
                      hover-class="default-hover-class"
                      hover-stay-time="100"
                      @click="onModeChange(DateModeEnum.MONTH)">

                    月账单

                </view>

                <view class="tab-item"
                      :class="{ 'active': activeMode === DateModeEnum.YEAR }"
                      hover-class="default-hover-class"
                      hover-stay-time="100"
                      @click="onModeChange(DateModeEnum.YEAR)">

                    年账单

                </view>

            </view>

            <view v-show="activeMode === DateModeEnum.MONTH" class="container">

                <view v-for="(item, key) in dateOptions"
                      :key="key">

                    <view class="year">{{ key }}年</view>

                    <view class="grid">

                        <view v-for="(month) in item"
                              :key="month"
                              class="grid-item"
                              :class="{ 'active': activeDate === month }"
                              :hover-class="activeDate === month ? 'default-hover-class' : 'gray-hover-class'"
                              hover-stay-time="100"
                              @click="onDateItemClick(month)">

                            {{ moment(month).format('M月') }}

                        </view>

                    </view>

                </view>

            </view>

            <view v-show="activeMode === DateModeEnum.YEAR" class="container">

                <view class="grid">

                    <view v-for="(item, year) in dateOptions"
                          :key="year"
                          class="grid-item"
                          :class="{ 'active': activeDate === year }"
                          :hover-class="activeDate === year ? 'default-hover-class' : 'gray-hover-class'"
                          hover-stay-time="100"
                          @click="onDateItemClick(year)">

                        {{ year }}年

                    </view>

                </view>

            </view>

        </view>

    </van-popup>
</template>

<style src="./style.scss" lang="scss" scoped/>

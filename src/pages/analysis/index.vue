<script setup name="analysis">

import { ref } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { } from '@/enums';
import { } from '@/constant';
import _ from 'lodash';
import moment from 'moment';

const {
} = useState();

const loading = ref(true);
const activeTabIndex = ref(0);
const dayList = ref([]);    // { label: '', value: ''; }
const monthList = ref([]);
const yearList = ref([]);

const onTabItemClick = (index) => {

    if (activeTabIndex.value !== index) {

        activeTabIndex.value = index;

    }

};

const initDay = (monthStr) => {

    let startDate = moment(monthStr).startOf('month');
    let endDate = moment(monthStr).endOf('month');

    let _startDateWeekday = moment(startDate).weekday();
    let _endDateWeekday = moment(endDate).weekday();

    // 计算出最近的星期一和最近的星期日
    let firstMonday = moment(startDate).subtract(_startDateWeekday, 'days');
    let lastSunday = moment(endDate).add(6 - _endDateWeekday, 'days');

    let diffDays = moment(lastSunday).diff(moment(firstMonday), 'days') + 1;

    let dayList = [];

    for (let i = 0; i < diffDays; i++) {

        dayList.push(moment(firstMonday).add(i, 'days').format('YYYY-MM-DD'));

    }

    console.log(_.chunk(dayList, 7));

};

const initMonth = () => { };

const initYear = () => { };

const onQueryForDay = () => { };

const onQueryForMonth = () => { };

const onQueryForYear = () => { };

onMounted(() => {

    uni.hideLoading();

    // initDay();

    // onQueryForDay();

});

onShareAppMessage();

</script>

<template>
    <view class="content">

        <view class="header">

            <view class="header-item">

                <view class="tab"
                      :class="{ 'tab-selected': activeTabIndex === 0 }"
                      @click="onTabItemClick(0)">
                    按天
                </view>

                <view class="tab"
                      :class="{ 'tab-selected': activeTabIndex === 1 }"
                      @click="onTabItemClick(1)">
                    按月
                </view>

                <view class="tab"
                      :class="{ 'tab-selected': activeTabIndex === 2 }"
                      @click="onTabItemClick(2)">
                    按年
                </view>

            </view>

        </view>

        <view class="structure">



        </view>

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>
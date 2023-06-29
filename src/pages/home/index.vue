<script setup name="home">

import { ref, computed } from 'vue';
import { onPullDownRefresh, onReachBottom, onPageScroll } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { rpx2px, getWeekday } from '@/utils';
import { defaultTagId, defaultPageSize } from '@/constant';
import { DateModeEnum, BillTypeEnum, PageStatusEnum } from '@/enums';
import { getBillRecord, getBillStatistics, deleteBill } from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';
import currency from 'currency.js';

import DatePicker from '@/components/date-picker';
import TagPicker from '@/components/tag-picker';
import BackToTop from '@/components/back-to-top';

// 全局数据
const {
    userId,
    avatar,
    tagsList
} = useState();

// 首次加载
const loading = ref(true);
// 默认头像
const defaultAvatar = ref('../../static/images/icon_avatar.png');
// 日期选择器相关
const showDatePicker = ref(false);
const activeDateMode = ref(DateModeEnum.MONTH);
const activeDate = ref(moment().format('YYYY-MM'));
// 标签选择器相关
const showTagPicker = ref(false);
const activeTagId = ref(defaultTagId);
// 金额相关
const totalExpenses = ref(0);
const totalIncome = ref(0);
// 列表相关
const pageNumber = ref(0);
const pageSize = ref(defaultPageSize);
const pageStatus = ref('');
const list = ref([]);
// 头部滑动高度
const headerScrollHeight = ref(rpx2px({ rpx: 80 }));
const showStickyInfo = ref(false);
// 显示返回顶部
const showBackToTop = ref(false);

const formatDate = computed(() => isYearMode() ? `${activeDate.value}年` : moment(activeDate.value).format('YYYY年M月'));

const formatTagName = computed(() => {

    const activeTag = _.find(tagsList.value, tag => tag._id === activeTagId.value);

    return !activeTag ? '' : activeTag.tagName;

});

const formatAmount = computed(() => (amount) => currency(amount).divide(100));

const formatTotalAmount = computed(() => currency(totalExpenses.value).subtract(totalIncome.value).divide(100));

const formatDay = computed(() => (time) => moment(time).format('M月D日'));

const formatWeekday = computed(() => (time) => getWeekday({ day: moment(time).day() }));

const isYearMode = () => activeDate.value.length === 4;

const getTimeRange = () => {

    let unit = activeDateMode.value === DateModeEnum.MONTH ? 'month' : 'year';

    return {
        startTime: moment(activeDate.value).startOf(unit).format('YYYY-MM-DD'),
        endTime: moment(activeDate.value).add(1, unit).startOf(unit).format('YYYY-MM-DD')
    };

};

const onDateModeChange = (mode) => {

    activeDateMode.value = mode;

};

const onDatePickerOpen = () => {

    showDatePicker.value = true;

};

const onDatePickerClose = () => {

    showDatePicker.value = false;

    setTimeout(() => activeDateMode.value = isYearMode() ? DateModeEnum.YEAR : DateModeEnum.MONTH, 300);

};

const onDateSelect = (date) => {

    activeDate.value = date;

    onDatePickerClose();

    onClear();

};

const onTagPickerOpen = () => {

    showTagPicker.value = true;

};

const onTagPickerClose = () => {

    showTagPicker.value = false;

};

const onTagSelect = (tagId) => {

    activeTagId.value = tagId;

    onTagPickerClose();

    onClear();

};

const onAvatarClick = () => {

    uni.navigateTo({
        url: '/pages/user-info/index'
    });

};

const onBillItemClick = (billId) => {

    uni.navigateTo({
        url: `/pages/detail/index?billId=${billId}`
    });

};

const onEditButtonClick = (billId) => {

    uni.navigateTo({
        url: `/pages/record/index?billId=${billId}`
    });

};

const onDeleteButtonClick = (billId) => {

    uni.showModal({
        title: '提示',
        content: '删除后无法恢复，是否删除？',
        showCancel: true,
    }).then(({ confirm }) => {

        if (confirm) {

            deleteBill({ billId }).then(() => {

                uni.showToast({ title: `已删除`, icon: 'none' });

                afterOperation();

            });

        }

    });

};

const onRecordButtonClick = () => {

    uni.navigateTo({
        url: '/pages/record/index'
    });

};

const onQuery = () => {

    const {
        startTime,
        endTime
    } = getTimeRange();

    if (pageSize.value <= 0) {

        pageSize.value = defaultPageSize;

    }

    return getBillRecord({
        userId: userId.value,
        tagId: activeTagId.value,
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
        startTime,
        endTime
    }).then((data) => {

        // 如果没有数据了
        if (data.length === 0) {

            if (pageNumber.value === 0) {

                list.value = [];

            }

            pageNumber.value--;
            pageStatus.value = PageStatusEnum.NOMORE;

        } else {

            // 相当于重新请求
            if (pageNumber.value === 0) {

                list.value = data;

            } else {

                let _list = _.cloneDeep(list.value);
                let _listEndIndex = _list.length - 1;

                // 判断每一个请求回来的数据
                _.each(data, (item, index) => {

                    if (index === 0 && item.billTime === _list[_listEndIndex].billTime) {

                        _list[_listEndIndex].billList = _.concat(_list[_listEndIndex].billList, item.billList);

                    } else {

                        _list = _.concat(_list, item);

                    }

                });

                list.value = _.cloneDeep(_list);

            }

            pageStatus.value = _.reduce(data, (meme, item) => meme + item.billList.length, 0) < pageSize.value
                ? PageStatusEnum.NOMORE : PageStatusEnum.LOADING;

        }

    });

};

const onQueryStatistics = () => {

    const {
        startTime,
        endTime
    } = getTimeRange();

    getBillStatistics({
        userId: userId.value,
        tagId: activeTagId.value,
        startTime,
        endTime
    }).then((data) => {

        totalExpenses.value = data.totalExpenses;
        totalIncome.value = data.totalIncome;

    });

};

const onClear = () => {

    pageStatus.value = '';
    pageSize.value = defaultPageSize;
    pageNumber.value = 0;

    uni.showLoading({ title: '加载中', mask: true });

    onQuery().then(() => {

        uni.hideLoading();
        uni.stopPullDownRefresh();
        uni.pageScrollTo({ scrollTop: 0, duration: 100 });

    });

    onQueryStatistics();

};

// 新增、编辑、删除之后的操作
const afterOperation = () => {

    pageSize.value = (pageNumber.value + 1) * defaultPageSize;
    pageNumber.value = 0;

    uni.showLoading({ title: '加载中', mask: true });

    onQuery().then(() => {

        uni.hideLoading();

    });

    onQueryStatistics();

};

onMounted(() => {

    onQuery().then(() => {

        loading.value = false;

        uni.hideLoading();

    });

    onQueryStatistics();

    // 监听: 新建账单后
    uni.$on('billCreated', () => afterOperation());
    // 监听: 更新账单后
    uni.$on('billUpdated', () => afterOperation());
    // 监听: 删除账单后
    uni.$on('billDeleted', () => afterOperation());

});

onPullDownRefresh(() => {

    onClear();

});

onReachBottom(() => {

    pageNumber.value++;

    onQuery();

});

onPageScroll(({ scrollTop }) => {

    showStickyInfo.value = scrollTop >= headerScrollHeight.value;
    showBackToTop.value = scrollTop >= (uni.getSystemInfoSync().windowHeight / 4);

});

onShareAppMessage();

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="header">

            <view class="header-item"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onDatePickerOpen">

                <view class="header-item-text1">{{ formatDate }}</view>
                <image class="header-item-img" src='../../static/svgs/icon_down_white.svg' />

            </view>

            <view class="header-item"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onTagPickerOpen">

                <image class="header-item-img" src='../../static/svgs/icon_more.svg' />
                <view class="header-item-text2">{{ formatTagName }}</view>

            </view>

        </view>

        <view class="blank-content" />

        <view v-show="showStickyInfo" class="sticky-info-content">

            <view class="stick-info">

                <view class="amount">

                    <text class="label"> {{ isYearMode() ? '年支出' : '月支出' }}</text>
                    <text class="value">{{ formatAmount(totalExpenses) }}</text>
                    <text class="label">{{ isYearMode() ? '年收入' : '月收入' }}</text>
                    <text class="value">{{ formatAmount(totalIncome) }}</text>

                </view>

                <image class="avatar"
                       :src="avatar || defaultAvatar"
                       @click="onAvatarClick" />

            </view>

        </view>

        <view class="info-content">

            <view class="info-wrapper">

                <view class="total"
                      :class="{
                          'expenses': formatTotalAmount > 0,
                          'income': formatTotalAmount < 0
                      }">

                    <text class="yuan">¥</text>
                    <text v-show="formatTotalAmount > 0">-</text>
                    <text v-show="formatTotalAmount < 0">+</text>
                    <text class="total-amount">{{ Math.abs(formatTotalAmount) }}</text>

                </view>

                <view class="statistics">

                    <text class="label">{{ isYearMode() ? '年支出' : '月支出' }}</text>
                    <text class="value">{{ formatAmount(totalExpenses) }}</text>
                    <text class="label">{{ isYearMode() ? '年收入' : '月收入' }}</text>
                    <text class="value">{{ formatAmount(totalIncome) }}</text>

                </view>

            </view>

            <image class="avatar"
                   :src="avatar || defaultAvatar"
                   @click="onAvatarClick" />

        </view>

        <view class="list-content">

            <view class="day-bill"
                  v-for="item in list"
                  :key="item.billTime">

                <view class="statistics">

                    <view class="time-content">

                        <text>{{ formatDay(item.billTime) }}</text>
                        <text>{{ formatWeekday(item.billTime) }}</text>

                    </view>

                    <view class="amount-content">

                        <view class="label">支出</view>
                        <view class="value">{{ formatAmount(item.totalExpenses) }}</view>
                        <view class="label">收入</view>
                        <view class="value">{{ formatAmount(item.totalIncome) }}</view>

                    </view>

                </view>

                <view class="list-item-wrapper"
                      v-for="bill in item.billList"
                      :key="bill._id">

                    <van-swipe-cell right-width="300">

                        <view class="list-item"
                              hover-class="gray-hover-class"
                              hover-stay-time="100"
                              @click="onBillItemClick(bill._id)">

                            <view class="icon"
                                  :class="{
                                      'expenses': bill.billType === BillTypeEnum.EXPENSES,
                                      'income': bill.billType === BillTypeEnum.INCOME
                                  }">

                                <image :src="bill.tagIcon" />

                            </view>

                            <view class="info">

                                <view class="tag">{{ bill.tagName }}</view>
                                <view v-if="bill.remark" class="remark">{{ bill.remark }}</view>

                            </view>

                            <view class="amount">

                                <text v-if="bill.billType === BillTypeEnum.EXPENSES" class="expenses">
                                    - {{ formatAmount(bill.expensesAmount) }}
                                </text>
                                <text v-if="bill.billType === BillTypeEnum.INCOME" class="income">
                                    + {{ formatAmount(bill.incomeAmount) }}
                                </text>

                            </view>

                        </view>

                        <view class="swipe-content" slot="right">

                            <view class="swipe-item swipe-edit"
                                  @click="onEditButtonClick(bill._id)">编辑
                            </view>

                            <view class="swipe-item swipe-delete"
                                  @click="onDeleteButtonClick(bill._id)">删除
                            </view>

                        </view>

                    </van-swipe-cell>

                </view>

            </view>

            <view v-if="pageStatus === PageStatusEnum.NOMORE && list.length === 0" class="no-data">

                <image src="../../static/svgs/pic_no_more.svg" />
                <text>暂无账单，快去记一笔吧^-^</text>

            </view>

            <view v-if="list.length !== 0" class="loading-content">

                <van-loading v-show="pageStatus === PageStatusEnum.LOADING" size="30rpx"
                             type="spinner">正在加载...</van-loading>
                <van-loading v-show="pageStatus === PageStatusEnum.NOMORE" size="30px"
                             type="">没有更多数据了，快去记一笔吧^-^</van-loading>

            </view>

        </view>

        <back-to-top :visible="showBackToTop" />

        <view class="record-button"
              hover-class="gray-hover-class"
              hover-stay-time="100"
              @tap.native.stop="onRecordButtonClick">

            <image src="../../static/svgs/icon_record.svg" />
            <text>记一笔</text>

        </view>

        <date-picker :visible="showDatePicker"
                     :active-mode="activeDateMode"
                     :active-date="activeDate"
                     @change="onDateModeChange"
                     @select="onDateSelect"
                     @close="onDatePickerClose" />

        <tag-picker :visible="showTagPicker"
                    :active-tag-id="activeTagId"
                    @select="onTagSelect"
                    @close="onTagPickerClose" />

        <!-- 用于解决ios的bug -->
        <view style="height: 1px" />

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>

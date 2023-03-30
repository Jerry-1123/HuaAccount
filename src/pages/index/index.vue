<script setup name="index">

import { ref, computed } from 'vue';
import { onPullDownRefresh, onReachBottom, onPageScroll } from "@dcloudio/uni-app";
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { rpx2px, getWeekday } from '@/util';
import { defaultTagId, defaultPageSize, dateModeEnum } from '@/constant';
import { getBillList, getBillStatistics, deleteBill } from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';
import currency from 'currency.js';

import DatePicker from '@/components/date_picker';
import TagPicker from '@/components/tag_picker';

// 全局数据
const {
    userId,
    avatar,
    tagsList
} = useState();

// 首次加载
const firstLoading = ref(true);
// 默认头像
const defaultAvatar = ref('../../static/images/avatar.png');
// 日期选择器相关
const showDatePicker = ref(false);
const activeDateMode = ref(dateModeEnum.month);
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

const formatDate = computed(() => isYearMode() ? `${activeDate.value}年` : moment(activeDate.value).format('YYYY年MM月'));

const formatTagName = computed(() => {

    const activeTag = _.find(tagsList.value, tag => tag._id === activeTagId.value);

    return !activeTag ? '' : activeTag.tagName;

});

const formatAmount = computed(() => (amount) => currency(amount).divide(100));

const formatTotalAmount = computed(() => currency(totalExpenses.value).subtract(totalIncome.value).divide(100));

const formatDay = computed(() => (time) => moment(time).format('MM月DD日'));

const formatWeekday = computed(() => (time) => getWeekday({ day: moment(time).day() }));

const isYearMode = () => activeDate.value.length === 4;

const getTimeRange = () => {

    let unit = activeDateMode.value === dateModeEnum.month ? 'month' : 'year';

    return {
        startTime: moment(activeDate.value).startOf(unit).format('YYYY-MM-DD'),
        endTime: moment(activeDate.value).add(1, unit).startOf(unit).format('YYYY-MM-DD')
    };

};

const onDateModeChange = ({ mode }) => activeDateMode.value = mode;

const onDatePickerOpen = () => showDatePicker.value = true;

const onDatePickerClose = () => {

    showDatePicker.value = false;

    setTimeout(() => activeDateMode.value = isYearMode() ? dateModeEnum.year : dateModeEnum.month, 300);

};

const onDateSelect = ({ date }) => {

    activeDate.value = date;

    onDatePickerClose();

    onClear();

};

const onTagPickerOpen = () => showTagPicker.value = true;

const onTagPickerClose = () => showTagPicker.value = false;

const onTagSelect = ({ tagId }) => {

    activeTagId.value = tagId;

    onTagPickerClose();
    
    onClear();

};

const onAvatarClick = () => {

    uni.navigateTo({
        url: '/pages/user_info/index'
    });

};

const onBillItemClick = ({ billId }) => {

    uni.navigateTo({
        url: `/pages/detail/index?billId=${billId}`
    });

};

const onEditButtonClick = ({ billId }) => {

    uni.navigateTo({
        url: `/pages/record/index?billId=${billId}`
    });

};

const onDeleteButtonClick = ({ billId }) => {

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

    return getBillList({
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
            pageStatus.value = 'noMore';

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
                ? 'noMore' : 'loading';

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

    uni.showLoading({ title: '加载中' });

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

    uni.showLoading({ title: '加载中' });

    onQuery().then(() => {

        uni.hideLoading();

    });

    onQueryStatistics();

};

onMounted(() => {

    onQuery().then(() => {

        firstLoading.value = false;

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

onPullDownRefresh(() => onClear());

onReachBottom(() => {

    pageNumber.value++;

    onQuery();

});

onPageScroll((e) => showStickyInfo.value = e.scrollTop >= headerScrollHeight.value);

onShareAppMessage();

</script>

<template>
    <view v-show="!firstLoading" class="content">

        <view class="header">

            <view class="header-item"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onDatePickerOpen">

                <view class="header-item-text1">{{ formatDate }}</view>
                <image class="header-item-img" src='../../static/svgs/down_white.svg'  />

            </view>

            <view class="header-item"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onTagPickerOpen">

                <image class="header-item-img" src='../../static/svgs/more.svg'  />
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

                        <text class="label">支出</text>
                        <text class="value">{{ formatAmount(item.totalExpenses) }}</text>
                        <text class="label">收入</text>
                        <text class="value">{{ formatAmount(item.totalIncome) }}</text>

                    </view>

                </view>

                <view class="list-item-wrapper"
                      v-for="bill in item.billList"
                      :key="bill._id">

                    <van-swipe-cell right-width="300">

                        <view class="list-item"
                              hover-class="gray-hover-class"
                              hover-stay-time="100"
                              @click="onBillItemClick({ billId: bill._id })">

                            <view class="icon"
                                  :class="{
                                      'expenses': bill.billType === 'expenses',
                                      'income': bill.billType === 'income'
                                  }">

                                <image :src="bill.tagIcon"  />

                            </view>

                            <view class="info">

                                <view class="tag">{{ bill.tagName }}</view>
                                <view v-if="bill.remark" class="remark">{{ bill.remark }}</view>

                            </view>

                            <view class="amount">

                                <text v-if="bill.billType === 'expenses'" class="expenses">
                                    - {{ formatAmount(bill.expensesAmount) }}
                                </text>
                                <text v-if="bill.billType === 'income'" class="income">
                                    + {{ formatAmount(bill.incomeAmount) }}
                                </text>

                            </view>

                        </view>

                        <view class="swipe-content" slot="right">

                            <view class="swipe-item swipe-edit"
                                  @click="onEditButtonClick({ billId: bill._id })">编辑
                            </view>

                            <view class="swipe-item swipe-delete"
                                  @click="onDeleteButtonClick({ billId: bill._id })">删除
                            </view>

                        </view>

                    </van-swipe-cell>

                </view>

            </view>

            <view v-if="pageStatus === 'noMore' && list.length === 0" class="no-data">

                <image src="../../static/svgs/no_more.svg"  />
                <text>暂无账单，快去记一笔吧^-^</text>

            </view>

            <view v-if="list.length !== 0" class="loading-content">

                <van-loading v-show="pageStatus === 'loading'" size="30rpx" type="spinner">正在加载...</van-loading>
                <van-loading v-show="pageStatus === 'noMore'" size="30px" type="">没有更多数据了，快去记一笔吧^-^</van-loading>

            </view>

        </view>

        <view class="record-button"
              hover-class="gray-hover-class"
              hover-stay-time="100"
              @click="onRecordButtonClick">

            <image src="../../static/svgs/record.svg"  />
            <text>记一笔</text>

        </view>

        <date-picker :show="showDatePicker"
                     :active-mode="activeDateMode"
                     :active-date="activeDate"
                     @change="onDateModeChange"
                     @select="onDateSelect"
                     @close="onDatePickerClose" />

        <tag-picker :show="showTagPicker"
                    :active-tag-id="activeTagId"
                    @select="onTagSelect"
                    @close="onTagPickerClose" />

        <!-- 用于解决ios的bug -->
        <view style="height: 1px" />

    </view>
</template>

<style>
page {
    background-color: #ededed;
}
</style>

<style lang="scss" scoped>
.content {
    height: 100%;

    .header {
        position: fixed;
        z-index: 30;
        width: 100%;
        top: 0;
        left: 0;
        background: $canbin-expenses-color;
        color: #ffffff;
        height: 80rpx;
        padding: 0 40rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &-item {
            display: flex;
            align-items: center;

            &-text1 {
                font-size: 34rpx;
                margin-right: 5rpx;
            }

            &-text2 {
                font-size: 30rpx;
                margin-left: 10rpx;
            }

            &-img {
                width: 32rpx;
                height: 32rpx;
            }

        }

    }

    .blank-content {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 80rpx;
        width: 100%;
        height: 80rpx;
        background: $canbin-expenses-color;
    }

    .sticky-info-content {
        position: fixed;
        z-index: 30;
        left: 0;
        top: 80rpx;
        width: 100%;
        height: 80rpx;
        line-height: 80rpx;
        padding: 0 40rpx;
        background: #fff;
        border-bottom: 1px solid #eaeaea;
        font-size: 30rpx;

        .stick-info {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .amount {
                display: flex;
                align-items: center;

                .label {
                    color: #8e8e8e;
                    margin-right: 20rpx;
                }

                .value {
                    font-weight: bold;
                    margin-right: 30rpx;
                    max-width: 150rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

            }

            .avatar {
                width: 55rpx;
                height: 55rpx;
                border-radius: 100%;
            }

        }

    }

    .info-content {
        position: relative;
        z-index: 20;
        margin: 80rpx 20rpx 20rpx;
        height: 160rpx;
        background: #ffffff;
        border: 1px solid #ececec;
        border-radius: 15rpx;
        padding: 20rpx 30rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .info-wrapper {
            flex-grow: 1;

            .total {
                font-size: 50rpx;
                font-weight: bold;
                display: flex;
                align-items: center;

                .yuan {
                    margin-right: 30rpx;
                }

                &-amount {
                    max-width: 420rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                &.expenses {
                    color: $canbin-expenses-color;
                }

                &.income {
                    color: $canbin-income-color
                }

            }

            .statistics {
                display: flex;
                align-items: center;
                font-size: 30rpx;
                margin-top: 20rpx;

                .label {
                    color: #8e8e8e;
                    margin-right: 12rpx;
                }

                .value {
                    font-weight: bold;
                    margin-right: 20rpx;
                    max-width: 140rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

            }
        }

        .avatar {
            flex-shrink: 0;
            width: 100rpx;
            height: 100rpx;
            border-radius: 100%;
        }

    }

    .list-content {
        position: relative;
        z-index: 20;

        .day-bill {
            background: #ffffff;
            margin: 20rpx;
            padding-bottom: 20rpx;
            border-radius: 15rpx;
            overflow: hidden;

            .statistics {
                background: #fbfbfb;
                padding: 25rpx 30rpx;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .time-content {
                    font-size: 30rpx;

                    text {
                        margin-right: 15rpx;
                    }

                }

                .amount-content {
                    font-size: 28rpx;
                    font-weight: bold;
                    display: flex;
                    align-items: center;

                    .label {
                        margin: 0 5rpx 0 10rpx;
                        color: #8e8e8e;
                    }

                    .value {
                        font-weight: bold;
                        max-width: 135rpx;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                }

            }

            .list-item-wrapper {
                margin: 0 30rpx;

                .list-item {
                    display: flex;
                    align-items: center;
                    padding: 25rpx;
                    border-bottom: 1px solid #ececec;

                    .icon {
                        width: 70rpx;
                        height: 70rpx;
                        border-radius: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;

                        &.expenses {
                            background: $canbin-expenses-color;
                        }

                        &.income {
                            background: $canbin-income-color;
                        }

                        image {
                            width: 45rpx;
                            height: 45rpx;
                        }

                    }

                    .info {
                        margin-left: 30rpx;
                        flex-grow: 1;

                        .tag {
                            font-size: 30rpx;
                        }

                        .remark {
                            width: 300rpx;
                            font-size: 26rpx;
                            color: #7e7e7e;
                            margin-top: 5rpx;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                    }

                    .amount {
                        font-weight: bold;
                        font-size: 36rpx;
                        flex-shrink: 0;

                        .expenses {
                            color: $canbin-expenses-color;
                        }

                        .income {
                            color: $canbin-income-color;
                        }

                    }

                }

                .swipe-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 300rpx;
                    height: 100%;
                    font-size: 30rpx;

                    .swipe-item {
                        height: 100%;
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 150rpx;
                    }

                    .swipe-edit {
                        background-color: #4c4c4c;
                    }

                    .swipe-delete {
                        background-color: #E75E58;
                    }

                }

            }


        }

        .no-data {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            image {
                width: 200rpx;
                height: 200rpx;
            }

            text {
                font-size: 30rpx;
                margin-top: 10rpx;
            }

        }

        .loading-content {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 30rpx 0;
        }

    }

    .record-button {
        position: fixed;
        z-index: 100;
        right: 40rpx;
        bottom: 40rpx;
        box-shadow: rgba(0, 0, 0, 0.15) 0px 5rpx 15rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20rpx 30rpx;
        background: #ffffff;
        border-radius: 100rpx;
        cursor: pointer;

        image {
            width: 40rpx;
            height: 40rpx;
        }

        text {
            color: $canbin-expenses-color;
            font-size: 28rpx;
            margin-left: 10rpx;
        }
    }

}
</style>
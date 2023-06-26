<template>
    <view v-if="!firstLoading" class="container">

        <view class="operation-content">

            <view class="tab-content">

                <view v-for="(item, index) in tabs"
                    :key="item.value"
                    :class="[
                        { 'tab': true },
                        { 'tab-expenses': selectTabIndex === 0 && index !== 1 },
                        { 'tab-income': selectTabIndex === 1 && index !== 0 }
                    ]"
                    @click="onTabItemClick({ index })">

                    {{ item.label }}

                </view>

            </view>

            <view v-if="selectCalendarTime !== ''"
                class="date"
                hover-class="date-hover"
                hover-stay-time="100"
                @click="onOpenCalendar()">

                <text>{{ selectCalendarDate }}</text>

                <image class="down-image" src="../../static/images/down.png" />

            </view>

        </view>

        <view class="amount-content">

            <image src="../../static/images/yuan.png" />

            <text class="amount">{{ amount }}</text>

            <span class="cursor"></span>

        </view>

        <view class="tag-content">

            <view v-show="selectTabIndex === 0">

                <view class="tag-wrapper">

                    <view v-for="(item, index) in expensesTags"
                        :key="item._id"
                        :class="['tag-item', selectExpensesTagIndex === index ? 'expenses-tag-item-selected' : '']"
                        @click="onTagItemClick({ index })">

                        <view class="tag-icon-wrapper">

                            <image v-show="selectExpensesTagIndex === index"
                                class="tag-icon"
                                :src="item.selectTagIcon" />

                            <image v-show="selectExpensesTagIndex !== index"
                                class="tag-icon"
                                :src="item.tagIcon" />

                        </view>

                        <view class="tag-name">{{ item.tagName }}</view>

                    </view>

                </view>

            </view>

            <view v-show="selectTabIndex === 1">

                <view class="tag-wrapper">

                    <view v-for="(item, index) in incomeTags"
                        :key="item._id"
                        :class="['tag-item', selectIncomeTagIndex === index ? 'income-tag-item-selected' : '']"
                        @click="onTagItemClick({ index })">

                        <view class="tag-icon-wrapper">

                            <image v-show="selectIncomeTagIndex === index"
                                class="tag-icon"
                                :src="item.selectTagIcon" />

                            <image v-show="selectIncomeTagIndex !== index"
                                class="tag-icon"
                                :src="item.tagIcon" />

                        </view>

                        <view class="tag-name">{{ item.tagName }}</view>

                    </view>

                </view>

            </view>

        </view>

        <view class="remark-content">

            <view v-show="remark.length === 0"
                class="remark-action"
                hover-class="action-hover"
                hover-stay-time="100"
                @click="onOpenRemarkPopup">

                添加备注

            </view>

            <view class="remark">{{ remark }}</view>

            <view v-show="remark.length !== 0"
                class="remark-action"
                hover-class="action-hover"
                hover-stay-time="100"
                @click="onOpenRemarkPopup">

                修改

            </view>

        </view>

        <view class="keyboard-content">

            <view class="keyboard-content-left">

                <view v-for="(item, index) in numbers"
                    :key="index"
                    :class="item === '0' ? 'keyboard-0' : 'keyboard'">

                    <view class="keyboard-item"
                        hover-class="keyboard-item-hover"
                        hover-stay-time="100"
                        @click="onNumberClick({ number: item })">

                        {{ item }}

                    </view>

                </view>

            </view>

            <view class="keyboard-content-right">

                <view class="keyboard-back">

                    <view class="keyboard-item"
                        hover-class="keyboard-item-hover"
                        hover-stay-time="100"
                        @click="onBackSpaceClick">

                        <image class="backspace-image" src="../../static/images/backspace.png" />

                    </view>

                </view>

                <view class="keyboard-confirm">

                    <view :class="[
                        { 'keyboard-item': true },
                        { 'keyboard-item-expenses-blank': selectTabIndex === 0 && amount === '' },
                        { 'keyboard-item-expenses': selectTabIndex === 0 && amount !== '' },
                        { 'keyboard-item-income-blank': selectTabIndex === 1 && amount === '' },
                        { 'keyboard-item-income': selectTabIndex === 1 && amount !== '' }
                    ]"
                        hover-class="action-hover"
                        hover-stay-time="100"
                        @click="onConfirmButtonClick">

                        <text class="confirm">确定</text>

                    </view>

                </view>

            </view>

        </view>

        <van-calendar
            title="请选择时间"
            :show="showCalendar"
            :showConfirm="false"
            :min-date="calendarMinDate"
            :max-date="calendarMaxDate"
            :color="selectTabIndex === 0 ? '#3eb575' : '#f0b73a'"
            @close="onCloseCalendar"
            @select="onSelectCalendar" />

        <van-popup
            :show="showRemarkPopup"
            round
            position="bottom"
            custom-style="height: 260px"
            closeable
            @close="onCloseRemarkPopup">

            <view class="popup-content">

                <view class="popup-title">添加备注</view>

                <input class="popup-input"
                    v-model="remarkInput"
                    cursor-spacing="200"
                    maxlength="30"
                    placeholder="请输入备注内容"
                    :adjust-position="true" />

                <view class="popup-size">{{ remarkInput.length }}/30</view>

                <view :class="[
                    { 'popup-confirm': true },
                    { 'popup-confirm-expenses': selectTabIndex === 0 && remarkInput !== '' },
                    { 'popup-confirm-income': selectTabIndex === 1 && remarkInput !== '' },
                ]"
                    :hover-class="remarkInput !== '' ? 'action-hover' : ''"
                    hover-stay-time="100"
                    @click="onRemarkConfirmButtonClick">

                    确定

                </view>

            </view>

        </van-popup>

    </view>
</template>

<script>

import _ from 'lodash';
import moment from 'moment';
import { minDate } from '../../constant';
import { createBill, updateBill, getDayBillCount, getBillByBillId } from '../../service/bill';
import { checkForPageLoad } from '../../common';

export default {
    data() {
        return {
            firstLoading: true,

            tabs: [{ label: '支出', value: 'expenses' }, { label: '收入', value: 'income' }],
            selectTabIndex: 0,

            expensesTags: [],
            selectExpensesTagIndex: 0,
            incomeTags: [],
            selectIncomeTagIndex: 0,

            showCalendar: false,
            calendarMinDate: moment(minDate).valueOf(),
            calendarMaxDate: moment().valueOf(),
            selectCalendarTime: '',

            showRemarkPopup: false,
            remark: '',
            remarkInput: '',

            numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."],
            amount: '',

            isSubmitting: false, // 为了防止提交的时候再次触发提交

            operation: '',
            billId: ''
        };
    },
    computed: {
        selectCalendarDate() {

            return moment(this.selectCalendarTime).format('MM月DD日');

        }
    },
    methods: {
        onTabItemClick({ index }) {

            this.selectTabIndex = index;

        },
        onTagItemClick({ index }) {

            if (this.selectTabIndex === 0) {

                this.selectExpensesTagIndex = index;

            } else {

                this.selectIncomeTagIndex = index;

            }

        },

        onOpenCalendar() {

            this.showCalendar = true;

        },
        onCloseCalendar() {

            this.showCalendar = false;

        },
        onSelectCalendar({ detail }) {

            setTimeout(() => {

                this.selectCalendarTime = detail.getTime();
                this.showCalendar = false;

            }, 100);

        },

        onOpenRemarkPopup() {

            this.showRemarkPopup = true;
            this.remarkInput = this.remark;

        },
        onCloseRemarkPopup() {

            this.showRemarkPopup = false;

        },
        onRemarkConfirmButtonClick() {

            if (this.remarkInput.length === 0) {

                return;

            }

            this.showRemarkPopup = false;
            this.remark = this.remarkInput;

        },

        onNumberClick({ number }) {

            const dotIndex = this.amount.indexOf('.');

            if (number === '.') {

                // 如果第一个是小数点
                if (this.amount === '') {

                    this.amount = '0.';

                    return;

                }

                // 只能输入一个小数点
                if (dotIndex > -1) {

                    return;

                }

            }

            // 小数点后只能有两位数字
            if (dotIndex > -1 && this.amount.substring(dotIndex, this.amount.length).length > 2) {

                return;

            }

            // 金额不能大于1000000
            if (this.amount !== '' && Number(this.amount + number) > 1000000) {

                uni.showToast({ title: '输入金额不能大于1,000,000', icon: 'none' });

                return;

            }

            this.amount += number;

        },
        onBackSpaceClick() {

            if (this.amount === '') {

                return;

            }

            this.amount = this.amount.substring(0, this.amount.length - 1);

        },
        onConfirmButtonClick() {

            if (!this.onValidate()) {

                return;

            }

            let data = {
                userId: getApp().globalData.userId,
                billType: this.tabs[this.selectTabIndex].value,
                expensesAmount: this.selectTabIndex === 0 ? parseInt(Number(this.amount) * 100) : 0,
                incomeAmount: this.selectTabIndex === 1 ? parseInt(Number(this.amount) * 100) : 0,
                remark: this.remark,
                billTime: moment(this.selectCalendarTime).format('YYYY-MM-DD'),
                tagId: this.selectTabIndex === 0
                    ? this.expensesTags[this.selectExpensesTagIndex]._id
                    : this.incomeTags[this.selectIncomeTagIndex]._id
            };

            // 限制同一天同一种类型最多提交10笔账单
            getDayBillCount({
                userId: data.userId,
                billTime: data.billTime,
                billType: data.billType
            }).then(({ total }) => {

                if (total >= 10) {

                    uni.showToast({ title: `同一天只能最多记录10笔${this.tabs[this.selectTabIndex].label}`, icon: 'none' });

                    return;

                }

                this.onSubmit({ data });

            });

        },

        onValidate() {

            if (this.isSubmitting) {

                return false;

            }

            if (this.amount === '') {

                uni.showToast({ title: '请输入具体金额', icon: 'none' });

                return false;

            }

            if (Number(this.amount) < 0.01) {

                uni.showToast({ title: '所输金额不得小于0.01', icon: 'none' });

                return false;

            }

            return true;

        },
        onSubmit({ data }) {

            uni.showLoading({ title: '记录中' });

            this.isSubmitting = true;

            if (this.operation === 'create') {

                // 提交账单
                createBill(data).then(() => {

                    uni.showToast({ title: '已记一笔', icon: 'success', duration: 1000 });

                    setTimeout(() => {

                        // 通知首页刷新
                        uni.$emit('billCreated', {});

                        uni.navigateBack();

                    }, 500);

                });

            } else if (this.operation === 'edit') {

                data.billId = this.billId;

                // 编辑账单
                updateBill(data).then(() => {

                    uni.showToast({ title: '编辑成功', icon: 'success', duration: 1000 });

                    setTimeout(() => {

                        // 通知首页刷新
                        uni.$emit('billUpdated', {});

                        if (getCurrentPages().length === 3) {

                            uni.navigateBack({
                                delta: 2
                            });

                        } else {

                            uni.navigateBack();

                        }

                    }, 500);

                });

            }

        }
    },
    onLoad({ operation, billId }) {

        uni.showLoading({ title: '加载中' });

        checkForPageLoad().then(() => {

            const tags = getApp().globalData.tags;

            this.expensesTags = _.filter(tags, item => item.tagType === 'expenses');
            this.incomeTags = _.filter(tags, item => item.tagType === 'income');

            this.operation = operation;

            uni.setNavigationBarTitle({
                title: operation === 'create' ? '记一笔' : '编辑'
            });

            if (operation === 'create') {

                // 当前选中日历时间为当前时间
                this.selectCalendarTime = moment().valueOf();

                this.firstLoading = false;

                setTimeout(() => {

                    uni.hideLoading();

                }, 500);

            } else if (operation === 'edit') {

                this.billId = billId;

                getBillByBillId({
                    billId
                }).then(({ bill }) => {

                    if (bill.billType === 'expenses') {

                        this.selectExpensesTagIndex = _.map(_.cloneDeep(this.expensesTags), (item) => item._id).indexOf(bill.tagId[0]._id);
                        this.amount = bill.expensesAmount / 100 + '';
                        this.selectTabIndex = 0;

                    }

                    if (bill.billType === 'income') {

                        this.selectIncomeTagIndex = _.map(_.cloneDeep(this.incomeTags), (item) => item._id).indexOf(bill.tagId[0]._id);
                        this.amount = bill.incomeAmount / 100 + '';
                        this.selectTabIndex = 1;

                    }

                    this.selectCalendarTime = moment(bill.billTime).valueOf();
                    this.remark = bill.remark;
                    this.remarkInput = bill.remark;

                    this.firstLoading = false;

                    setTimeout(() => {

                        uni.hideLoading();

                    }, 500);

                });

            }

        });

    },
    onShareAppMessage() {

        return {
            title: '欢迎进入花花记账本~',
            path: '/pages/index/index',
            imageUrl: '/static/images/share.jpg'
        };

    }
};
</script>

<style lang="scss">
page {
    height: 100%;
}

.container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .operation-content {
        flex-shrink: 0;
        padding: 50rpx 50rpx 30rpx;
        display: flex;
        justify-content: space-between;
        font-size: 34rpx;

        .tab-content {
            display: flex;

            .tab {
                margin-right: 30rpx;
                padding: 10rpx 20rpx;
                color: #acabab;
                background: #f7f7f7;
                border-radius: 4px;
            }

            .tab-expenses {
                background: #eef8f3;
                color: $canbin-expenses-color;
            }

            .tab-income {
                background: #fff5e1;
                color: $canbin-income-color;
            }

        }

        .date {
            padding: 10rpx 10rpx 10rpx 20rpx;
            color: #1a1a1a;
            background: #f7f7f7;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;

            .down-image {
                width: 40rpx;
                height: 40rpx;
            }

        }

        .date-hover {
            background: #dedede;
        }

    }

    .amount-content {
        flex-shrink: 0;
        height: 110rpx;
        margin: 10rpx 50rpx;
        padding-bottom: 35rpx;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        align-items: center;

        image {
            width: 65rpx;
            height: 65rpx;
        }

        .amount {
            color: #000000;
            font-size: 72rpx;
            margin-left: 10rpx;
        }

        .cursor {
            width: 2px;
            height: 100%;
            background: #000000;
            margin-left: 15rpx;
            animation: cursor-blinks 1.5s infinite steps(1, start);
        }

    }

    .tag-content {
        flex-grow: 1;
        overflow: scroll;
        padding: 40rpx 45rpx;

        .tag-wrapper {
            display: flex;
            flex-wrap: wrap;

            .tag-item {
                width: 110rpx;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20rpx 15rpx 15rpx;
                color: #7e7e7e;

                .tag-icon-wrapper {
                    width: 80rpx;
                    height: 80rpx;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f7f7f7;

                    .tag-icon {
                        width: 45rpx;
                        height: 45rpx;
                    }

                }

                .tag-name {
                    margin-top: 15rpx;
                    font-size: 24rpx;
                }

            }

            .expenses-tag-item-selected {
                box-shadow: rgba(0, 0, 0, 0.08) 0px 4rpx 12rpx;
                color: $canbin-expenses-color;

                .tag-icon-wrapper {
                    background: $canbin-expenses-color;

                    .tag-icon {
                        transform: scale(1.1);
                    }

                }

            }

            .income-tag-item-selected {
                box-shadow: rgba(0, 0, 0, 0.08) 0px 4rpx 12rpx;
                color: $canbin-income-color;

                .tag-icon-wrapper {
                    background: $canbin-income-color;

                    .tag-icon {
                        transform: scale(1.1);
                    }

                }

            }

        }

    }

    .remark-content {
        flex-shrink: 0;
        padding: 30rpx 50rpx;
        display: flex;
        align-items: center;

        .remark-action {
            flex-shrink: 0;
            font-size: 32rpx;
            color: #59667f;
        }

        .remark {
            flex-grow: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 30rpx;
            color: #808080;
        }

    }

    .keyboard-content {
        flex-shrink: 0;
        width: 100%;
        background: #fafafa;
        display: flex;
        padding: 10rpx;
        align-items: flex-start;
        margin-bottom: 20rpx;

        .keyboard-content-left {
            width: 75%;
            display: flex;
            flex-wrap: wrap;
        }

        .keyboard-content-right {
            width: 25%;
        }

        .keyboard {
            width: 33%;
            padding: 10rpx;
            height: 120rpx;
        }

        .keyboard-0 {
            width: 66%;
            padding: 10rpx;
            height: 120rpx;
        }

        .keyboard-back {
            padding: 10rpx;
            height: 120rpx;
        }

        .keyboard-confirm {
            padding: 10rpx;
            height: 360rpx;
        }

        .keyboard-item {
            width: 100%;
            height: 100%;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            font-weight: bold;
            font-size: 40rpx;
        }

        .backspace-image {
            width: 60rpx;
            height: 60rpx;
        }

        .confirm {
            color: #ffffff;
            font-size: 35rpx;
            font-weight: normal;
        }

        .keyboard-item-expenses-blank {
            background: $canbin-expenses-color;
        }

        .keyboard-item-expenses {
            background: $canbin-expenses-color;
        }

        .keyboard-item-income-blank {
            background: $canbin-income-color;
        }

        .keyboard-item-income {
            background: $canbin-income-color;
        }

        .keyboard-item-hover {
            background: #e5e5e5;
        }

    }

    .popup-content {
        position: relative;

        .popup-title {
            height: 50px;
            line-height: 50px;
            text-align: center;
        }

        .popup-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 16px;
            height: 16px;
        }

        .popup-input {
            background: #f7f7f7;
            margin: 10px 40px;
            padding: 16px;
            border-radius: 4px;
        }

        .popup-size {
            margin: 15px 44px;
            font-size: 14px;
            color: #797979;
        }

        .popup-confirm {
            color: #797979;
            border-radius: 4px;
            margin: 25px auto;
            width: 180px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            background: #F2F2F2;
        }

        .popup-confirm-expenses {
            background: $canbin-expenses-color;
            color: #ffffff;
        }

        .popup-confirm-income {
            background: $canbin-income-color;
            color: #ffffff;
        }

    }

}

.action-hover {
    opacity: 0.8;
}

@keyframes cursor-blinks {
    0% {
        opacity: 1;
        display: block;
    }

    50% {
        opacity: 0;
        display: none;
    }

    100% {
        opacity: 1;
        display: block;
    }
}
</style>

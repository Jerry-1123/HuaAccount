<script setup name="record">

import { ref, reactive, computed } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { useShare } from '@/hooks/useShare';
import { useState } from '@/hooks/useState';
import { minDate } from '@/constant';
import { getBillByBillId, getDayBillCount, createBill, updateBill } from '@/service/bill';
import moment from 'moment';
import _ from 'lodash';
import currency from 'currency.js';

// 全局数据
const {
    userId,
    expenseTags,
    incomeTags,
} = useState();

// 表单信息
const formData = reactive({
    billId: '',
    userId: '',
    billType: '',
    billTime: '',
    tagId: '',
    amount: '',
    remark: ''
});

// 加载
const loading = ref(true);
// 日历选择相关
const showCalendar = ref(false);
const calendarMinDate = moment(minDate).valueOf();
const calendarMaxDate = moment().valueOf();
// 备注相关
const showRemarkPopup = ref(false);
const remarkInput = ref('');
// 键盘
const numbers = ref(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."]);
// 为了防止提交的时候再次触发提交
const isSubmitting = ref(false);

const formatDate = computed(() => moment(formData.billTime).format('MM月DD日'));

const onTabItemClick = ({ billType }) => {

    formData.billType = billType;
    formData.tagId = billType === 'expenses' ? expenseTags.value[0]._id : incomeTags.value[0]._id;

};

const onTagItemClick = ({ tagId }) => formData.tagId = tagId;

const onCalendarOpen = () => showCalendar.value = true;

const onCalendarClose = () => showCalendar.value = false;

const onCalendarSelect = ({ detail }) => {

    formData.billTime = moment(detail.getTime()).format('YYYY-MM-DD');

    onCalendarClose();

};

const onRemarkPopupOpen = () => {

    showRemarkPopup.value = true;
    remarkInput.value = formData.remark;

};

const onRemarkPopupClose = () => showRemarkPopup.value = false;

const onSaveRemarkButtonClick = () => {

    if (remarkInput.value.length === 0) {
        return;
    }

    showRemarkPopup.value = false;
    formData.remark = remarkInput.value;

};

const onNumberClick = ({ number }) => {

    const dotIndex = formData.amount.indexOf('.');

    if (number === '.') {

        // 如果第一个是小数点
        if (formData.amount === '') {
            formData.amount = '0.';
            return;
        }

        // 只能输入一个小数点
        if (dotIndex > -1) {
            return;
        }

    }

    // 小数点后只能有两位数字
    if (dotIndex > -1 && formData.amount.substring(dotIndex, formData.amount.length).length > 2) {
        return;
    }

    // 金额不能大于1000000
    if (formData.amount !== '' && Number(formData.amount + number) > 1000000) {
        uni.showToast({ title: '输入金额不能大于1,000,000', icon: 'none' });
        return;
    }

    formData.amount += number;

};

const onBackSpaceClick = () => {

    if (formData.amount === '') {
        return;
    }

    formData.amount = formData.amount.substring(0, formData.amount.length - 1);

};

const onConfirmButtonClick = () => {

    if (isSubmitting.value) {
        return;
    }

    if (!formData.amount) {
        uni.showToast({ title: '请输入具体金额', icon: 'none' });
        return;
    }

    if (Number(formData.amount) < 0.01) {
        uni.showToast({ title: '所输金额不得小于0.01', icon: 'none' });
        return;
    }

    uni.showLoading({ title: '记录中' });

    isSubmitting.value = true;

    // 限制同一天同一种类型最多提交10笔账单
    getDayBillCount({
        userId: formData.userId,
        billTime: formData.billTime,
        billType: formData.billType
    }).then(({ total }) => {

        if (total >= 10) {

            uni.showToast({ title: `同一天只能最多记录10笔${formData.billType === 'expenses' ? '支出' : '收入'}`, icon: 'none' });

            isSubmitting.value = false;

            return;

        }

        if (!formData.billId) {

            // 提交账单
            createBill({
                userId: formData.userId,
                billType: formData.billType,
                expensesAmount: formData.billType === 'expenses' ? currency(formData.amount).multiply(100).value : 0,
                incomeAmount: formData.billType === 'income' ? currency(formData.amount).multiply(100).value : 0,
                remark: formData.remark,
                billTime: formData.billTime,
                tagId: formData.tagId
            }).then(() => {

                uni.showToast({ title: '已记一笔', icon: 'success', duration: 1000 });

                setTimeout(() => {

                    uni.navigateBack();

                    // 通知首页刷新
                    uni.$emit('billCreated', {});

                }, 500);

            });

        } else {

            // 编辑账单
            updateBill({
                billId: formData.billId,
                userId: formData.userId,
                billType: formData.billType,
                expensesAmount: formData.billType === 'expenses' ? currency(formData.amount).multiply(100).value : 0,
                incomeAmount: formData.billType === 'income' ? currency(formData.amount).multiply(100).value : 0,
                remark: formData.remark,
                billTime: formData.billTime,
                tagId: formData.tagId
            }).then(() => {

                uni.showToast({ title: '编辑成功', icon: 'success', duration: 1000 });

                setTimeout(() => {

                    if (getCurrentPages().length === 3) {

                        uni.navigateBack({
                            delta: 2
                        });

                    } else {

                        uni.navigateBack();

                    }

                    // 通知首页刷新
                    uni.$emit('billUpdated', {});

                }, 500);

            });

        }

    });

};

onMounted(({ billId }) => {

    uni.setNavigationBarTitle({
        title: !billId ? '记一笔' : '编辑'
    });

    if (!billId) {

        formData.billId = '';
        formData.userId = userId;
        formData.billType = 'expenses';
        formData.billTime = moment().format('YYYY-MM-DD');
        formData.tagId = expenseTags.value[0]._id;
        formData.amount = '';
        formData.remark = '';

        remarkInput.value = '';
        loading.value = false;

        setTimeout(() => uni.hideLoading(), 200);

    } else {

        getBillByBillId({
            billId
        }).then(({
            userId,
            billType,
            tagId,
            billTime,
            expensesAmount,
            incomeAmount,
            remark
        }) => {

            formData.billId = billId;
            formData.userId = userId;
            formData.billType = billType;
            formData.billTime = billTime;
            formData.tagId = tagId[0]._id;
            formData.amount = `${currency(billType === 'expenses' ? expensesAmount : incomeAmount).divide(100).value}`;
            formData.remark = remark;

            remarkInput.value = remark;
            loading.value = false;

            setTimeout(() => uni.hideLoading(), 200);

        });

    }

});

useShare().onShareAppMessage();

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="action-content">

            <view class="tab">

                <view class="tab-item"
                      :class="{ 'expenses': formData.billType === 'expenses' }"
                      @click="onTabItemClick({ billType: 'expenses' })">
                    支出
                </view>

                <view class="tab-item"
                      :class="{ 'income': formData.billType === 'income' }"
                      @click="onTabItemClick({ billType: 'income' })">
                    收入
                </view>

            </view>

            <view v-if="formData.billTime"
                  class="date"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onCalendarOpen">

                <text>{{ formatDate }}</text>
                <image src="../../static/svgs/down.svg" lazy-load />

            </view>

        </view>

        <view class="amount-content">

            <image src="../../static/svgs/yuan.svg" lazy-load />
            <text class="amount">{{ formData.amount }}</text>
            <span class="cursor"></span>

        </view>

        <view class="tag-content">

            <view v-show="formData.billType === 'expenses'">

                <view class="tag-wrapper">

                    <view v-for="item in expenseTags"
                          :key="item._id"
                          class="tag"
                          :class="{ 'expenses': formData.tagId === item._id }"
                          @click="onTagItemClick({ tagId: item._id })">

                        <view class="tag-icon">

                            <image v-show="formData.tagId === item._id"
                                   :src="item.selectTagIcon"
                                   lazy-load />

                            <image v-show="formData.tagId !== item._id"
                                   :src="item.tagIcon"
                                   lazy-load />

                        </view>

                        <view class="tag-name">
                            {{ item.tagName }}
                        </view>

                    </view>

                </view>

            </view>

            <view v-show="formData.billType === 'income'">

                <view class="tag-wrapper">

                    <view v-for="item in incomeTags"
                          :key="item._id"
                          class="tag"
                          :class="{ 'income': formData.tagId === item._id }"
                          @click="onTagItemClick({ tagId: item._id })">

                        <view class="tag-icon">

                            <image v-show="formData.tagId === item._id"
                                   :src="item.selectTagIcon"
                                   lazy-load />

                            <image v-show="formData.tagId !== item._id"
                                   :src="item.tagIcon"
                                   lazy-load />

                        </view>

                        <view class="tag-name">
                            {{ item.tagName }}
                        </view>

                    </view>

                </view>

            </view>

        </view>

        <view class="remark-content">

            <view v-show="formData.remark.length === 0"
                  class="remark-action"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onRemarkPopupOpen">
                添加备注
            </view>

            <view class="remark">{{ formData.remark }}</view>

            <view v-show="formData.remark.length !== 0"
                  class="remark-action"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onRemarkPopupOpen">
                修改
            </view>

        </view>

        <view class="keyboard-content">

            <view class="keyboard-wrapper" style="width:75%">

                <view v-for="(item, index) in numbers"
                      :key="index"
                      class="keyboard"
                      :class="{ 'keyboard-0': item === '0' }">

                    <view class="keyboard-item"
                          hover-class="gray-hover-class"
                          hover-stay-time="100"
                          @click="onNumberClick({ number: item })">

                        {{ item }}

                    </view>

                </view>

            </view>

            <view class="keyboard-wrapper" style="width:25%">

                <view class="keyboard-back">

                    <view class="keyboard-item"
                          hover-class="gray-hover-class"
                          hover-stay-time="100"
                          @click="onBackSpaceClick">

                        <image src="../../static/svgs/backspace.svg" />

                    </view>

                </view>

                <view class="keyboard-confirm">

                    <view class="keyboard-item"
                          :class="{
                              'expenses': formData.billType === 'expenses',
                              'income': formData.billType === 'income'
                          }"
                          hover-class="default-hover-class"
                          hover-stay-time="100"
                          @click="onConfirmButtonClick">

                        确定

                    </view>

                </view>

            </view>

        </view>

        <van-calendar title="请选择时间"
                      :show="showCalendar"
                      :showConfirm="false"
                      :min-date="calendarMinDate"
                      :max-date="calendarMaxDate"
                      :color="formData.billType === 'expenses' ? '#3eb575' : '#f0b73a'"
                      @close="onCalendarClose"
                      @select="onCalendarSelect" />

        <van-popup :show="showRemarkPopup"
                   round
                   position="bottom"
                   custom-style="height: 600rpx"
                   closeable
                   @close="onRemarkPopupClose">

            <view class="popup">

                <view class="popup-title">添加备注</view>

                <input class="popup-input"
                       v-model="remarkInput"
                       cursor-spacing="200"
                       maxlength="30"
                       placeholder="请输入备注内容"
                       :adjust-position="true" />

                <view class="popup-length">{{ remarkInput.length }}/30</view>

                <view class="popup-button"
                      :class="{
                          'expenses': formData.billType === 'expenses' && remarkInput.length > 0,
                          'income': formData.billType === 'income' && remarkInput.length > 0
                      }"
                      :hover-class="remarkInput.length > 0 ? 'default-hover-class' : ''"
                      hover-stay-time="100"
                      @click="onSaveRemarkButtonClick">

                    确 定

                </view>

            </view>

        </van-popup>

    </view>
</template>

<style>
page {
    height: 100%;
}
</style>

<style lang="scss" scoped>
.content {
    display: flex;
    flex-direction: column;
    height: 100%;

    .action-content {
        flex-shrink: 0;
        padding: 50rpx 50rpx 30rpx;
        display: flex;
        justify-content: space-between;
        font-size: 34rpx;

        .tab {
            display: flex;

            &-item {
                margin-right: 30rpx;
                padding: 10rpx 20rpx;
                color: #acabab;
                background: #f7f7f7;
                border-radius: 4px;

                &.expenses {
                    background: #eef8f3;
                    color: $canbin-expenses-color;
                }

                &.income {
                    background: #fff5e1;
                    color: $canbin-income-color;
                }

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

            image {
                width: 40rpx;
                height: 40rpx;
            }
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

            .tag {
                width: 110rpx;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20rpx 15rpx 15rpx;
                color: #7e7e7e;

                &.expenses {
                    box-shadow: rgba(0, 0, 0, 0.08) 0px 4rpx 12rpx;
                    color: $canbin-expenses-color;

                    .tag-icon {
                        background: $canbin-expenses-color;

                        image {
                            transform: scale(1.1);
                        }

                    }

                }

                &.income {
                    box-shadow: rgba(0, 0, 0, 0.08) 0px 4rpx 12rpx;
                    color: $canbin-income-color;

                    .tag-icon {
                        background: $canbin-income-color;

                        image {
                            transform: scale(1.1);
                        }

                    }

                }

                &-icon {
                    width: 80rpx;
                    height: 80rpx;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f7f7f7;

                    image {
                        width: 45rpx;
                        height: 45rpx;
                    }

                }

                &-name {
                    margin-top: 15rpx;
                    font-size: 24rpx;
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

        .keyboard-wrapper {
            display: flex;
            flex-wrap: wrap;
        }

        .keyboard {
            width: 33%;
            padding: 10rpx;
            height: 120rpx;

            &-0 {
                width: 66%;
            }

        }

        .keyboard-back {
            width: 100%;
            padding: 10rpx;
            height: 120rpx;

            image {
                width: 60rpx;
                height: 60rpx;
            }

        }

        .keyboard-confirm {
            width: 100%;
            padding: 10rpx;
            height: 360rpx;
            color: #ffffff;
            font-size: 35rpx;
            font-weight: normal;
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

            &.expenses {
                background: $canbin-expenses-color;
            }

            &.income {
                background: $canbin-income-color;
            }

        }

    }

    .popup {
        position: relative;

        &-title {
            height: 100rpx;
            line-height: 100rpx;
            text-align: center;
            font-size: 32rpx;
        }

        &-input {
            background: #f7f7f7;
            margin: 10px 40px;
            padding: 16px;
            border-radius: 4px;
            font-size: 30rpx;
        }

        &-length {
            margin: 15px 44px;
            color: #797979;
            font-size: 28rpx;
        }

        &-button {
            color: #797979;
            border-radius: 4px;
            margin: 25px auto;
            width: 180px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            background: #F2F2F2;
            font-size: 30rpx;

            &.expenses {
                background: $canbin-expenses-color;
                color: #ffffff;
            }

            &.income {
                background: $canbin-income-color;
                color: #ffffff;
            }

        }

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
}
</style>
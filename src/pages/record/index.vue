<script setup name="record">

import { ref, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import {
    onLoad,
    onShareAppMessage
} from "@dcloudio/uni-app";
import { checkForPageLoad } from '@/common';
import {
    getBillByBillId,
    getDayBillCount,
    createBill,
    updateBill
} from '@/service/bill';
import { minDate } from '@/constant';
import moment from 'moment';
import _ from 'lodash-es';
import currency from 'currency.js';

const userStore = useUserStore();
const appStore = useAppStore();

// 用户信息
const {
    userId
} = storeToRefs(userStore);
// 应用信息
const {
    expenseTags,
    incomeTags,
    shareData
} = storeToRefs(appStore);

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
// 为了防止提交的时候再次触发提交
const isSubmitting = ref(false);

const formatDate = computed(() => moment(formData.billTime).format('MM月DD日'));

const onTabItemClick = ({ billType }) => {

    formData.billType = billType;

};

const onTagItemClick = ({ tagId }) => {

};

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

    showRemarkPopup.value = false;
    formData.remark = remarkInput.value;

};

const onNumberClick = ({ number }) => { };

const onBackSpaceClick = () => { };

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

};

onLoad(({ billId }) => {

    uni.showLoading({ title: '加载中' });

    uni.setNavigationBarTitle({
        title: !billId ? '记一笔' : '编辑'
    });

    checkForPageLoad().then(() => {

        if (!billId) {

            formData.billId = '';
            formData.userId = userId;
            formData.billType = 'expense';
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
                formData.amount = `${currency(billType === 'expenses' ? expensesAmount : incomeAmount).divide(100)}`;
                formdata.remark = remark;

                remarkInput.value = remark;
                loading.value = false;

                setTimeout(() => uni.hideLoading(), 200);

            });

        }

    });

});

onShareAppMessage(() => shareData.value);

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="action-content">

            <view class="tab">

                <view class="tab-item"
                      :class="{ expense: formData.billType === 'expense' }"
                      @click="onTabItemClick({ billType: 'expense' })">
                    支出
                </view>

                <view class="tab-item"
                      :class="{ income: formData.billType === 'income' }"
                      @click="onTabItemClick({ billType: 'income' })">
                    收入
                </view>

            </view>

            <view class="date"
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

        <van-calendar title="请选择时间"
                      :show="showCalendar"
                      :showConfirm="false"
                      :min-date="calendarMinDate"
                      :max-date="calendarMaxDate"
                      :color="formData.billType === 'expense' ? '#3eb575' : '#f0b73a'"
                      @close="onCalendarClose"
                      @select="onCalendarSelect" />

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

                &.expense {
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
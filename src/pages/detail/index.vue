<script setup name="detail">

import { ref, reactive } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { getWeekday } from '@/util';
import { getBillByBillId, deleteBill } from '@/service/bill';
import moment from 'moment';
import currency from 'currency.js';

// 账单信息
const bill = reactive({
    billId: '',
    billType: '',
    tagIcon: '',
    tagName: '',
    billTime: '',
    amount: '',
    remark: ''
});

// 加载
const loading = ref(true);

const onEditButtonClick = () => {

    uni.navigateTo({
        url: `/pages/record/index?billId=${bill.billId}`
    });

};

const onDeleteButtonClick = () => {

    uni.showModal({
        title: '提示',
        content: '删除后无法恢复，是否删除？',
        showCancel: true,
    }).then(({ confirm }) => {

        if (confirm) {

            uni.showLoading({ title: '删除中' });

            deleteBill({ billId: bill.billId }).then(() => {

                uni.showToast({ title: `已删除`, icon: 'none' });

                setTimeout(() => {

                    // 通知首页刷新
                    uni.$emit('billDeleted', {});
                    uni.navigateBack();

                }, 500);

            });

        }

    });

};

onMounted(({ billId }) => {

    getBillByBillId({
        billId
    }).then(({
        billType,
        tagId,
        billTime,
        expensesAmount,
        incomeAmount,
        remark
    }) => {

        uni.setNavigationBarTitle({
            title: billType === 'expenses' ? '支出' : '收入'
        });

        bill.billId = billId;
        bill.billType = billType;
        bill.tagName = tagId[0].tagName;
        bill.tagIcon = tagId[0].selectTagIcon;
        bill.billTime = `${moment(billTime).format('YYYY年MM月DD日')} ${getWeekday({ day: moment(billTime).day() })}`;
        bill.amount = `${billType === 'expenses' ? '-' : '+'} ${currency(billType === 'expenses' ? expensesAmount : incomeAmount).divide(100)}`;
        bill.remark = remark;

        loading.value = false;

        setTimeout(() => uni.hideLoading(), 200);

    });

});

onShareAppMessage();

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="tag">

            <view class="tag-icon"
                  :class="{
                      'expenses': bill.billType === 'expenses',
                      'income': bill.billType === 'income'
                  }">

                <image :src="bill.tagIcon" lazy-load />

            </view>

            <text class="tag-name">{{ bill.tagName }}</text>

        </view>

        <view class="amount">{{ bill.amount }}</view>

        <view class="cell">

            <view class="label">记账日期</view>
            <view class="value">{{ bill.billTime }}</view>

        </view>

        <view class="cell">

            <view class="label">备注</view>
            <view class="value">{{ bill.remark || '-' }}</view>

        </view>

        <view class="button-content">

            <view class="button button-delete"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onDeleteButtonClick">

                <image src="../../static/svgs/delete.svg" lazy-load />
                <text class="delete">删除</text>

            </view>

            <view class="button"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onEditButtonClick">

                <image src="../../static/svgs/edit.svg" lazy-load />
                <text class="edit">编辑</text>

            </view>

        </view>

    </view>
</template>

<style>
page {
    background-color: #ededed;
}
</style>
  
<style lang="scss" scoped>
.content {
    background: #ffffff;
    margin: 30rpx;
    padding: 50rpx 30rpx;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .tag {
        display: flex;
        align-items: center;

        &-icon {
            width: 70rpx;
            height: 70rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7f7f7;

            &.expenses {
                background-color: $canbin-expenses-color;
            }

            &.income {
                background-color: $canbin-income-color;
            }

            image {
                width: 40rpx;
                height: 40rpx;
            }

        }

        &-name {
            width: 100rpx;
            margin-left: 20rpx;
            font-size: 36rpx;
        }
    }

    .amount {
        margin-top: 30rpx;
        margin-bottom: 40rpx;
        font-size: 70rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
    }

    .cell {
        width: 100%;
        display: flex;
        margin: 10rpx;
        padding: 0 30rpx;
        font-size: 32rpx;

        .label {
            width: 180rpx;
            color: #8e8e8e;
        }

        .value {
            width: 400rpx;
        }

    }

    .button-content {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 30rpx;
        border-top: 1px solid #e3e3e3;
        padding-top: 35rpx;

        .button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 300rpx;
            font-size: 30rpx;
            background: #ffffff;

            &-delete {
                border-right: 1px solid #e3e3e3;
            }

            image {
                width: 40rpx;
                height: 40rpx;
                margin-right: 20rpx;
            }

            .delete {
                color: #cd6661;
            }

        }

    }

}
</style>
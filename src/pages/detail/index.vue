<script setup name="detail">

import { ref, reactive } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { getWeekday } from '@/utils';
import { BillTypeEnum } from '@/enums';
import { getBillByBillId, deleteBill } from '@/service/bill';
import moment from 'moment';
import currency from 'currency.js';

// 加载
const loading = ref(true);
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

            uni.showLoading({ title: '删除中', mask: true });

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

onMounted(({
    billId
}) => {

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
            title: billType === BillTypeEnum.EXPENSES ? '支出' : '收入'
        });

        bill.billId = billId;
        bill.billType = billType;
        bill.tagName = tagId[0].tagName;
        bill.tagIcon = tagId[0].selectTagIcon;
        bill.billTime = `${moment(billTime).format('YYYY年M月D日')} ${getWeekday({ day: moment(billTime).day() })}`;
        bill.amount = `${billType === BillTypeEnum.EXPENSES ? '-' : '+'} ${currency(billType === BillTypeEnum.EXPENSES ? expensesAmount : incomeAmount).divide(100)}`;
        bill.remark = remark;

        loading.value = false;

        uni.hideLoading();

    });

});

onShareAppMessage();

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="tag">

            <view class="tag-icon"
                  :class="{
                      'expenses': bill.billType === BillTypeEnum.EXPENSES,
                      'income': bill.billType === BillTypeEnum.INCOME
                  }">

                <image :src="bill.tagIcon" />

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

                <image src="../../static/svgs/icon_delete.svg" />
                <text class="delete">删除</text>

            </view>

            <view class="button"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onEditButtonClick">

                <image src="../../static/svgs/icon_edit.svg" />
                <text class="edit">编辑</text>

            </view>

        </view>

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>

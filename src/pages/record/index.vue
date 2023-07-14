<script setup name="record">

import { ref, reactive, computed } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { minDate } from '@/constant';
import { BillTypeEnum } from '@/enums';
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

const formatDate = computed(() => moment(formData.billTime).format('M月D日'));

const onTabItemClick = (billType) => {

    formData.billType = billType;
    formData.tagId = billType === BillTypeEnum.EXPENSES ? expenseTags.value[0]._id : incomeTags.value[0]._id;

};

const onTagItemClick = (tagId) => {

    formData.tagId = tagId;

};

const onCalendarOpen = () => {

    showCalendar.value = true;

};

const onCalendarClose = () => {

    showCalendar.value = false;

};

const onCalendarSelect = ({ detail }) => {

    formData.billTime = moment(detail.getTime()).format('YYYY-MM-DD');

    onCalendarClose();

};

const onRemarkPopupOpen = () => {

    showRemarkPopup.value = true;
    remarkInput.value = formData.remark;

};

const onRemarkPopupClose = () => {

    showRemarkPopup.value = false;

};

const onSaveRemarkButtonClick = () => {

    if (remarkInput.value.length === 0) {
        return;
    }

    showRemarkPopup.value = false;
    formData.remark = remarkInput.value;

};

const onNumberClick = (number) => {

    wx.vibrateShort({
        type: 'light'
    });

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

    wx.vibrateShort({
        type: 'light'
    });

    if (formData.amount === '') {
        return;
    }

    formData.amount = formData.amount.substring(0, formData.amount.length - 1);

};

const onConfirmButtonClick = () => {

    wx.vibrateShort({
        type: 'light'
    });

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

    uni.showLoading({ title: '记录中', mask: true });

    isSubmitting.value = true;

    // 限制同一天同一种类型最多提交30笔账单
    getDayBillCount({
        userId: formData.userId,
        billTime: formData.billTime,
        billType: formData.billType
    }).then((total) => {

        if (total >= 30) {

            uni.showToast({ title: `同一天只能最多记录30笔${formData.billType === BillTypeEnum.EXPENSES ? '支出' : '收入'}`, icon: 'none' });

            isSubmitting.value = false;

            return;

        }

        if (!formData.billId) {

            // 提交账单
            createBill({
                userId: formData.userId,
                billType: formData.billType,
                expensesAmount: formData.billType === BillTypeEnum.EXPENSES ? currency(formData.amount).multiply(100).value : 0,
                incomeAmount: formData.billType === BillTypeEnum.INCOME ? currency(formData.amount).multiply(100).value : 0,
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

            }).finally(() => {

                isSubmitting.value = false;

            });

        } else {

            // 编辑账单
            updateBill({
                billId: formData.billId,
                userId: formData.userId,
                billType: formData.billType,
                expensesAmount: formData.billType === BillTypeEnum.EXPENSES ? currency(formData.amount).multiply(100).value : 0,
                incomeAmount: formData.billType === BillTypeEnum.INCOME ? currency(formData.amount).multiply(100).value : 0,
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

            }).finally(() => {

                isSubmitting.value = false;

            });

        }

    });

};

onMounted(({
    billId
}) => {

    uni.setNavigationBarTitle({
        title: !billId ? '记一笔' : '编辑'
    });

    if (!billId) {

        formData.billId = '';
        formData.userId = userId;
        formData.billType = BillTypeEnum.EXPENSES;
        formData.billTime = moment().format('YYYY-MM-DD');
        formData.tagId = expenseTags.value[0]._id;
        formData.amount = '';
        formData.remark = '';

        remarkInput.value = '';
        loading.value = false;

        uni.hideLoading();

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
            formData.amount = `${currency(billType === BillTypeEnum.EXPENSES ? expensesAmount : incomeAmount).divide(100).value}`;
            formData.remark = remark;

            remarkInput.value = remark;
            loading.value = false;

            uni.hideLoading();

        });

    }

});

onShareAppMessage();

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="action-content">

            <view class="tab">

                <view class="tab-item"
                      :class="{ 'expenses': formData.billType === BillTypeEnum.EXPENSES }"
                      :hover-class="formData.billType === BillTypeEnum.EXPENSES ? '' : 'gray-hover-class'"
                      hover-stay-time="100"
                      @click="onTabItemClick(BillTypeEnum.EXPENSES)">支出
                </view>

                <view class="tab-item"
                      :class="{ 'income': formData.billType === BillTypeEnum.INCOME }"
                      :hover-class="formData.billType === BillTypeEnum.INCOME ? '' : 'gray-hover-class'"
                      hover-stay-time="100"
                      @click="onTabItemClick(BillTypeEnum.INCOME)">收入
                </view>

            </view>

            <view v-if="formData.billTime"
                  class="date"
                  hover-class="gray-hover-class"
                  hover-stay-time="100"
                  @click="onCalendarOpen">

                <text>{{ formatDate }}</text>
                <image src="../../static/svgs/icon_down.svg" />

            </view>

        </view>

        <view class="amount-content">

            <image src="../../static/svgs/icon_yuan.svg" />
            <text class="amount">{{ formData.amount }}</text>
            <span class="cursor"></span>

        </view>

        <view class="tag-content">

            <view v-show="formData.billType === BillTypeEnum.EXPENSES">

                <view class="tag-wrapper">

                    <view v-for="tag in expenseTags"
                          :key="tag._id"
                          class="tag"
                          :class="{ 'expenses': formData.tagId === tag._id }"
                          @click="onTagItemClick(tag._id)">

                        <view class="tag-icon">

                            <image v-show="formData.tagId === tag._id"
                                   :src="tag.selectTagIcon" />
                            <image v-show="formData.tagId !== tag._id"
                                   :src="tag.tagIcon" />

                        </view>

                        <view class="tag-name">{{ tag.tagName }}</view>

                    </view>

                </view>

            </view>

            <view v-show="formData.billType === BillTypeEnum.INCOME">

                <view class="tag-wrapper">

                    <view v-for="tag in incomeTags"
                          :key="tag._id"
                          class="tag"
                          :class="{ 'income': formData.tagId === tag._id }"
                          @click="onTagItemClick(tag._id)">

                        <view class="tag-icon">

                            <image v-show="formData.tagId === tag._id"
                                   :src="tag.selectTagIcon" />
                            <image v-show="formData.tagId !== tag._id"
                                   :src="tag.tagIcon" />

                        </view>

                        <view class="tag-name">{{ tag.tagName }}</view>

                    </view>

                </view>

            </view>

        </view>

        <view class="remark-content">

            <view v-show="formData.remark.length === 0"
                  class="remark-action"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onRemarkPopupOpen">添加备注
            </view>

            <view class="remark">{{ formData.remark }}</view>

            <view v-show="formData.remark.length !== 0"
                  class="remark-action"
                  hover-class="default-hover-class"
                  hover-stay-time="100"
                  @click="onRemarkPopupOpen">修改
            </view>

        </view>

        <view class="keyboard-content">

            <view class="keyboard-wrapper" style="width:75%">

                <view v-for="(number, index) in numbers"
                      :key="index"
                      class="keyboard"
                      :class="{ 'keyboard-0': number === '0' }">

                    <view class="keyboard-item"
                          hover-class="gray-hover-class"
                          hover-stay-time="100"
                          @click="onNumberClick(number)">

                        {{ number }}

                    </view>

                </view>

            </view>

            <view class="keyboard-wrapper" style="width:25%">

                <view class="keyboard-back">

                    <view class="keyboard-item"
                          hover-class="gray-hover-class"
                          hover-stay-time="100"
                          @click="onBackSpaceClick">

                        <image src="../../static/svgs/icon_backspace.svg" />

                    </view>

                </view>

                <view class="keyboard-confirm">

                    <view class="keyboard-item"
                          :class="{
                              'expenses': formData.billType === BillTypeEnum.EXPENSES,
                              'income': formData.billType === BillTypeEnum.INCOME
                          }"
                          hover-class="default-hover-class"
                          hover-stay-time="100"
                          @click="onConfirmButtonClick">确定
                    </view>

                </view>

            </view>

        </view>

        <van-calendar title="请选择时间"
                      :show="showCalendar"
                      :showConfirm="false"
                      :min-date="calendarMinDate"
                      :max-date="calendarMaxDate"
                      :color="formData.billType === BillTypeEnum.EXPENSES ? '#3eb575' : '#f0b73a'"
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
                          'expenses': formData.billType === BillTypeEnum.EXPENSES && remarkInput.length > 0,
                          'income': formData.billType === BillTypeEnum.INCOME && remarkInput.length > 0
                      }"
                      :hover-class="remarkInput.length > 0 ? 'default-hover-class' : ''"
                      hover-stay-time="100"
                      @click="onSaveRemarkButtonClick">确 定
                </view>

            </view>

        </van-popup>

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>

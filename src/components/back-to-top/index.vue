<script setup name="back-to-top">

import { BillTypeEnum } from '@/enums';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    billType: {
        type: String,
        default: BillTypeEnum.EXPENSES
    }
});

const onBackToTop = () => {

    uni.pageScrollTo({ scrollTop: 0, duration: 100 });

};

</script>

<template>
    <view v-if="visible"
          class="button"
          hover-class="gray-hover-class"
          hover-stay-time="100"
          @tap.native.stop="onBackToTop">

        <image v-show="billType === BillTypeEnum.EXPENSES" src="../../static/svgs/icon_up_expenses.svg" />
        <image v-show="billType === BillTypeEnum.INCOME" src="../../static/svgs/icon_up_income.svg" />

    </view>
</template>

<style src="./style.scss" lang="scss" scoped/>

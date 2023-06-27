<!-- 组件公共模版 -->
<script setup name="component">

import { ref } from 'vue';
import { useState } from '@/hooks/useState';
import { } from '@/service';
import { } from '@/enums';
import { } from '@/constant';
import _ from 'lodash';

const emit = defineEmits(['close']);

const props = defineProps({
    visible: {
        type: Boolean,
        default: true
    }
});

const {
} = useState();

</script>

<template>
    <view class="content">

    </view>
</template>

<style src="./style.scss" lang="scss" scoped/>
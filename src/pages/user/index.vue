<script setup name="user">

import { ref, computed } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';

// 全局数据
const {
    userId
} = useState();

onMounted(() => {



});

onShareAppMessage();

</script>

<template></template>

<style></style>

<style lang="scss" scoped></style>
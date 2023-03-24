<script setup name="user">

import { ref, computed } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { useShare } from '@/hooks/useShare';
import { useState } from '@/hooks/useState';

// 全局数据
const {
    userId
} = useState();

onMounted(() => {



});

useShare().onShareAppMessage();

</script>

<template></template>

<style></style>

<style lang="scss" scoped></style>
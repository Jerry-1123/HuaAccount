<script setup name="app">
import { checkForUpdateApp } from '@/common';
import { onLaunch } from "@dcloudio/uni-app";

onLaunch(() => {

    checkForUpdateApp();

});

</script>

<template></template>

<style>
/*每个页面公共css */
</style>

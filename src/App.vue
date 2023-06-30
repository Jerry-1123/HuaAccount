<script setup name="app">

import { onLaunch } from "@dcloudio/uni-app";

onLaunch(() => {

    // 检查更新
    const updateManager = uni.getUpdateManager();

    updateManager.onUpdateReady(() => updateManager.applyUpdate());

});

</script>

<template></template>

<style></style>

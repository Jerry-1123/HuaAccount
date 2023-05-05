<script setup name="app">

import { onLaunch } from "@dcloudio/uni-app";

onLaunch(() => {

    // 检查更新
    const updateManager = uni.getUpdateManager();

    updateManager.onUpdateReady(() => {

        uni.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
        }).then((res) => {

            if (res.confirm) {

                updateManager.applyUpdate();

            }

        });

    });

});

</script>

<template></template>

<style></style>

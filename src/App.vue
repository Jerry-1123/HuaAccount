<script setup name="app">

import { onLaunch } from "@dcloudio/uni-app";
import { useCommon } from "@/hooks/useCommon";

onLaunch(() => {

    const { checkForUpdateApp } = useCommon();

    checkForUpdateApp();

});

</script>

<template></template>

<style></style>

<script setup name="app">

import { checkForUpdateApp } from '@/common';
import { onLaunch } from "@dcloudio/uni-app";

onLaunch(() => checkForUpdateApp());

</script>

<template></template>

<style></style>

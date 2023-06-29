<script setup name="tag-picker">

import { useState } from '@/hooks/useState';
import { BillTypeEnum } from '@/enums';

const emit = defineEmits(['select', 'close']);

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    activeTagId: {
        type: String,
        default: ''
    }
});

const {
    tagsGroup
} = useState();

const onTagItemClick = (tagId) => {

    if (tagId !== props.activeTagId) {

        emit('select', tagId);

    }

};

const onPopupClose = () => {

    emit('close');

};

</script>

<template>
    <van-popup :show="visible"
               :safe-area-inset-bottom="false"
               custom-style="height: 800rpx"
               position="bottom"
               round
               closeable
               duration="200"
               @close="onPopupClose">

        <view class="content">

            <view class="title">请选择类型</view>

            <view class="tag-content">

                <view v-for="(tags, key) in tagsGroup"
                      :key="key">

                    <view v-if="key === BillTypeEnum.EXPENSES" class="tag-type">支出 </view>
                    <view v-if="key === BillTypeEnum.INCOME" class="tag-type">收入 </view>

                    <view class="tag-list">

                        <view v-for="tag in tags"
                              :key="tag._id"
                              class="tag-item"
                              :class="{ 'active': activeTagId === tag._id }"
                              :hover-class="activeTagId === tag._id ? 'default-hover-class' : 'gray-hover-class'"
                              hover-stay-time="100"
                              @click="onTagItemClick(tag._id)">

                            {{ tag.tagName }}

                        </view>

                    </view>

                </view>

            </view>

        </view>

    </van-popup>
</template>

<style src="./style.scss" lang="scss" scoped/>

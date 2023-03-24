<script setup name="tag-picker">

import { useState } from '@/hooks/useState';

const {
    tagsGroup
} = useState();

defineProps({
    show: {
        type: Boolean,
        default: false
    },
    activeTagId: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['select', 'close']);

const onTagItemClick = ({ tagId }) => emit('select', { tagId });

const onPopupClose = () => emit('close');

</script>

<template>
    <van-popup :show="show"
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

                    <view v-if="key === 'expenses'" class="tag-type">支出 </view>
                    <view v-if="key === 'income'" class="tag-type">收入 </view>

                    <view class="tag-list">

                        <view v-for="tag in tags"
                              :key="tag._id"
                              class="tag-item"
                              :class="{ active: activeTagId === tag._id }"
                              hover-class="default-hover-class"
                              hover-stay-time="100"
                              @click="onTagItemClick({ tagId: tag._id })">

                            {{ tag.tagName }}

                        </view>

                    </view>

                </view>

            </view>

        </view>

    </van-popup>
</template>
  
<style lang="scss" scoped>
.content {
    background: #fafafa;

    .title {
        height: 100rpx;
        line-height: 100rpx;
        text-align: center;
        font-size: 32rpx;
    }

    .tag-content {
        height: 700rpx;
        overflow: scroll;
        padding: 0 40rpx 40rpx;
        font-size: 28rpx;

        .tag-type {
            margin: 30rpx 30rpx 10rpx;
            color: #acabab;
        }

        .tag-list {
            display: flex;
            flex-wrap: wrap;

            .tag-item {
                padding: 20rpx 0;
                margin: 10rpx;
                width: 203rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffffff;
                cursor: pointer;

                &.active {
                    color: #ffffff;
                    background: $canbin-expenses-color;
                    border-radius: 3px;
                }

            }

            .tag-item-selected {
                color: #ffffff;
                background: $canbin-expenses-color;
                border-radius: 3px;
            }

        }

    }

}
</style>
  
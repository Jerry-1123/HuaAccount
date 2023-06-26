<template>
    <view class="container">

        <view class="title">请选择类型</view>

        <view class="tag-content">

            <view class="tag-list">

                <view :class="['tag-item', selectTagId === '' ? 'tag-item-selected' : '']"
                    hover-class="select-hover"
                    hover-stay-time="100"
                    @click="onTagItemClick({ tagId: '' })">

                    全部类型

                </view>

                <view :class="['tag-item', selectTagId === 'allExpenses' ? 'tag-item-selected' : '']"
                    hover-class="select-hover"
                    hover-stay-time="100"
                    @click="onTagItemClick({ tagId: 'allExpenses' })">

                    全部支出

                </view>

                <view :class="['tag-item', selectTagId === 'allIncome' ? 'tag-item-selected' : '']"
                    hover-class="select-hover"
                    hover-stay-time="100"
                    @click="onTagItemClick({ tagId: 'allIncome' })">

                    全部收入

                </view>

            </view>

            <view v-for="(item,key) in tagList"
                :key="key">

                <view class="tag-type">{{ key === 'income' ? '收入' : '支出' }}</view>

                <view class="tag-list">

                    <view v-for="tag in item"
                        :key="tag._id"
                        :class="['tag-item', selectTagId === tag._id ? 'tag-item-selected' : '']"
                        hover-class="select-hover"
                        hover-stay-time="100"
                        @click="onTagItemClick({ tagId: tag._id })">

                        {{tag.tagName}}
                        
                    </view>

                </view>

            </view>

        </view>
        
    </view>
</template>

<script>

export default {
    name: 'bill-tag-picker',
    props: {
        selectTagId: String,
        tagList: Object
    },
    methods: {
        onTagItemClick({ tagId }) {

            this.$emit('itemClick', { tagId });

        }
    }
};
</script>

<style scoped lang="scss">
.container {
    height: 100%;
    background: #fafafa;

    .title {
        height: 50px;
        line-height: 50px;
        text-align: center;
    }

    .tag-item {
        padding: 20rpx 0;
        margin: 10rpx;
        width: 203rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
    }

    .tag-item-selected {
        color: #ffffff;
        background: $canbin-expenses-color;
        border-radius: 3px;
    }

    .tag-content {
        height: 370px;
        overflow: scroll;
        padding: 0 40rpx;

        .tag-type {
            font-size: 28rpx;
            margin: 30rpx 30rpx 10rpx;
            color: #acabab;
        }

        .tag-list {
            display: flex;
            flex-wrap: wrap;
        }
    }

}
</style>
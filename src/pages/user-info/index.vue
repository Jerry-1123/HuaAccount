<script setup name="user-info">

import { ref } from 'vue';
import { useUserStore } from '@/store/user';
import { onMounted } from '@/hooks/onMounted';
import { useShare } from '@/hooks/useShare';
import { useState } from '@/hooks/useState';
import { getUserByOpenId, updateUser } from '@/service/user';
import moment from 'moment';

const userStore = useUserStore();

// 页面分享
const { onShareAppMessage } = useShare();

// 全局信息
const {
    openId
} = useState();

// 加载
const loading = ref(true);
// 昵称
const nickName = ref('');
// 头像
const avatar = ref('../../static/images/avatar.png');
// 为了防止提交的时候再次触发提交
const isSubmitting = ref(false);

const onAvatarClick = (e) => avatar.value = e.detail.avatarUrl;

const onInputChange = (e) => nickName.value = e.detail.value;

const onSubmitButtonClick = () => {

    if (isSubmitting.value) {
        return;
    }

    if (!avatar.value) {
        uni.showToast({ title: '请选择头像', icon: 'none' });
        return;
    }

    if (!nickName.value) {
        uni.showToast({ title: '请选择输入昵称', icon: 'none' });
        return;
    }

    uni.showLoading({ title: '保存中' });

    isSubmitting.value = true;

    (avatar.value.includes('cloudstorage')
        ? Promise.resolve({
            success: true,
            fileID: avatar.value
        })
        : uniCloud.uploadFile({
            filePath: avatar.value,
            cloudPath: `${openId.value}_${moment().valueOf()}.jpg`,
            fileType: 'image'
        })
    ).then(({
        success,
        fileID
    }) => {

        if (success) {

            updateUser({
                openId: openId.value,
                nickName: nickName.value,
                avatarUrl: fileID
            }).then(() => {

                userStore.$patch((state) => {
                    state.nickName = nickName.value;
                    state.avatar = fileID;
                });

                uni.showToast({ title: '保存成功', icon: 'success', duration: 1000 });

                setTimeout(() => uni.navigateBack(), 200);

            });

        }

    });

};

onMounted(() => {

    getUserByOpenId({
        openId: openId.value
    }).then(({ userInfo }) => {

        loading.value = false;
        nickName.value = userInfo.nickName;
        avatar.value = userInfo.avatarUrl;

        setTimeout(() => uni.hideLoading(), 200);

    });

});

onShareAppMessage();

</script>

<template>
    <view v-show="!loading" class="content">

        <view class="cell-content">

            <view class="cell">

                <view class="label">头像</view>

                <view class="value">

                    <button class="avatar-wrapper"
                            open-type="chooseAvatar"
                            @chooseavatar="onAvatarClick">

                        <image :src="avatar" lazy-load />

                    </button>

                </view>

            </view>

            <view class="cell">

                <view class="label">昵称</view>

                <view class="value">

                    <input class="input"
                           :value="nickName"
                           type="nickname"
                           placeholder="请输入昵称"
                           @blur="onInputChange"
                           @input="onInputChange" />

                </view>

            </view>

        </view>

        <button class="button"
                hover-class="default-hover-class"
                hover-stay-time="100"
                @click="onSubmitButtonClick">保 存
        </button>

    </view>
</template>
  
<style>
page {
    height: 100%;
}
</style>

<style lang="scss" scoped>
.content {
    height: 100%;
    background-color: #fff;
    margin-top: 20rpx;

    .cell {
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgb(235, 237, 240);
        height: 120rpx;
        padding: 0 40rpx;
        font-size: 32rpx;

        .label {
            width: 100rpx;
            flex-shrink: 0;
        }

        .value {
            flex-grow: 1;
            display: flex;
            flex-direction: row-reverse;
            align-items: center;

            .avatar-wrapper {
                padding: 0;
                width: 80rpx !important;
                padding: 0;
                margin: 0;
                border-radius: 100%;
                overflow: hidden;

                &::after {
                    border: none;
                }

                image {
                    display: block;
                    width: 80rpx;
                    height: 80rpx;
                }

            }

            .input {
                text-align: right;
                margin-right: 10rpx;
            }

        }

    }

    .button {
        color: #fff;
        border: 0;
        border-radius: 10rpx;
        font-size: 35rpx;
        line-height: 1.3;
        padding: 20rpx 75rpx;
        margin: 40rpx 30rpx;
        background: $canbin-expenses-color;
    }

}
</style>
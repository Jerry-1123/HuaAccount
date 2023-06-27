<script setup name="user-info">

import { ref } from 'vue';
import { onMounted } from '@/hooks/onMounted';
import { onShareAppMessage } from '@/hooks/onShareAppMessage';
import { useState } from '@/hooks/useState';
import { getUserByOpenId, updateUser } from '@/service/user';
import moment from 'moment';

// 全局信息
const {
    openId,
    changeUserInfo
} = useState();

// 加载
const loading = ref(true);
// 昵称
const nickName = ref('');
// 头像
const avatar = ref('../../static/images/icon_avatar.png');
// 为了防止提交的时候再次触发提交
const isSubmitting = ref(false);

const onAvatarClick = (e) => {

    avatar.value = e.detail.avatarUrl;

};

const onInputChange = (e) => {

    nickName.value = e.detail.value;

};

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

    uni.showLoading({ title: '保存中', mask: true });

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

                changeUserInfo({
                    nickName: nickName.value,
                    avatar: fileID
                });

                uni.showToast({ title: '保存成功', icon: 'success', duration: 1000 });

                setTimeout(() => uni.navigateBack(), 500);

            });

        }

    });

};

onMounted(() => {

    getUserByOpenId({
        openId: openId.value
    }).then(({ userInfo }) => {

        nickName.value = userInfo.nickName;
        avatar.value = userInfo.avatarUrl || '../../static/images/icon_avatar.png';

        loading.value = false;

        uni.hideLoading();

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

                        <image :src="avatar" />

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
                @click="onSubmitButtonClick">
                
                保 存

        </button>

    </view>
</template>

<style src="./page.scss" lang="scss"/>
<style src="./style.scss" lang="scss" scoped/>

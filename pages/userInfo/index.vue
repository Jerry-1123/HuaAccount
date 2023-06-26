<template>
	<view class="container">

		<view class="cell-container">

			<view class="cell">

				<view class="label">头像</view>

				<view class="value">

					<button
						class="avatar-wrapper"
						open-type="chooseAvatar"
						@chooseavatar="onChooseAvatar">

						<image v-if="!avatarUrl" class="avatar" src="../../static/images/avatar.png" />
						<image v-else class="avatar" :src="avatarUrl" />

					</button>

				</view>

			</view>

			<view class="cell">

				<view class="label">昵称</view>

				<view class="value">

					<input
						class="input"
						:value="nickName"
						type="nickname"
						placeholder="请输入昵称"
						@blur="onInputChange"
						@input="onInputChange" />

				</view>

			</view>

		</view>

		<button
			class="button"
			hover-class="hover"
			@click="onSubmit">保 存
		</button>

	</view>
</template>

<script>
import { checkForPageLoad } from '../../common';
import { getUserByOpenId, updateUser } from '../../service/user';
import moment from 'moment';

export default {
	data() {
		return {
			avatarUrl: '',
			nickName: ''
		};
	},
	methods: {
		onChooseAvatar(e) {

			this.avatarUrl = e.detail.avatarUrl;

		},
		onInputChange(e) {

			this.nickName = e.detail.value;

		},
		onSubmit() {

			if (!this.avatarUrl) {

				uni.showToast({ title: '请选择头像', icon: 'none' });
				return;

			}

			if (!this.nickName) {

				uni.showToast({ title: '请选择输入昵称', icon: 'none' });
				return;

			}

			uni.showLoading({ title: '保存中' });

			const openId = getApp().globalData.openId;

			let promise = null;

			if (this.avatarUrl.includes('cloudstorage')) {

				promise = Promise.resolve({
					success: true,
					fileID: this.avatarUrl
				});

			} else {

				promise = uniCloud.uploadFile({
					filePath: this.avatarUrl,
					cloudPath: `${openId}_${moment().valueOf()}.jpg`,
					fileType: 'image'
				});

			}

			promise.then(({
				success,
				fileID
			}) => {

				if (success) {

					updateUser({
						openId,
						nickName: this.nickName,
						avatarUrl: fileID
					}).then(() => {

						this.$store.commit('setAvatar', fileID);
						this.$store.commit('setNickName', this.nickName);

						uni.showToast({ title: '保存成功', icon: 'success', duration: 1000 });

						setTimeout(() => {

							uni.navigateBack();

						}, 500);

					});

				}

			});

		}
	},
	onLoad() {

		uni.showLoading({ title: '加载中' });

		checkForPageLoad().then(() => {

			const openId = getApp().globalData.openId;

			getUserByOpenId({
				openId
			}).then(({ userInfo }) => {

				this.avatarUrl = userInfo.avatarUrl;
				this.nickName = userInfo.nickName;

				setTimeout(() => {

					uni.hideLoading();

				}, 200);

			});

		});

	}
};
</script>

<style lang="scss">
page {
	height: 100%;
	background: #ededed;
}

.container {
	height: 100%;
	background-color: #fff;
	margin-top: 20rpx;

	.cell {
		display: flex;
		align-items: center;
		border-bottom: 1px solid rgb(235, 237, 240);
		height: 120rpx;
		padding: 0 40rpx 0 25rpx;
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
				width: 48px !important;
				padding: 0;
				margin: 0;
				border-radius: 100%;
				overflow: hidden;

				&::after {
					border: none;
				}

				.avatar {
					display: block;
					width: 48px;
					height: 48px;
				}

			}

			.input {
				text-align: right;
			}

		}

	}

	.button {
		color: #fff;
		border: 0;
		border-radius: 100rpx;
		font-size: 35rpx;
		line-height: 1.3;
		padding: 20rpx 75rpx;
		margin: 35rpx 25rpx;
		background: $canbin-expenses-color;
	}

	.hover {
		opacity: 0.8;
	}

}
</style>

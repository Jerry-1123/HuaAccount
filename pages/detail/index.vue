<template>
	<view v-if="!firstLoading" class="container">

		<view class="tag-content">

			<view :class="[
				{ 'tag-icon': true },
				{ 'tag-icon-expenses': billInfo.billType === 'expenses' },
				{ 'tag-icon-income': billInfo.billType === 'income' }
			]">

				<image :src="tagIcon" />

			</view>

			<text class="tag-name">{{ tagName }}</text>

		</view>

		<view class="amount">

			<text>{{ billInfo.billType === 'expenses' ? '-' : '+' }}</text>

			<text>{{ amount }}</text>

		</view>

		<view class="cell">

			<view class="label">记账日期</view>

			<view class="value">{{ billTime }}</view>

		</view>

		<view class="cell">

			<view class="label">备注</view>

			<view class="value">{{ billInfo.remark || '-' }}</view>

		</view>

		<view class="button-content">

			<view class="button button-delete" hover-class="button-hover" hover-stay-time="100"
				@click="onDeleteButtonClick">

				<image src="../../static/images/delete.png"></image>

				<text class="delete">删除</text>

			</view>

			<view class="button" hover-class="button-hover" hover-stay-time="100" @click="onEditButtonClick">

				<image src="../../static/images/edit.png"></image>

				<text class="edit">编辑</text>

			</view>

		</view>

	</view>
</template>

<script>

import _ from 'lodash';
import moment from 'moment';
import { deleteBill, getBillByBillId } from '../../service/bill';
import { checkForPageLoad } from '../../common';

export default {
	data() {
		return {
			firstLoading: true,
			billInfo: {},
			tagName: '',
			tagIcon: '',
			billTime: '',
			amount: ''
		};
	},
	methods: {
		onEditButtonClick() {

			uni.navigateTo({
				url: `/pages/bookkeeping/index?operation=edit&billId=${this.billInfo._id}`
			});

		},
		onDeleteButtonClick() {

			uni.showModal({
				title: '提示',
				content: '删除后无法恢复，是否删除？',
				showCancel: true,
			}).then(({ confirm }) => {

				if (confirm) {

					deleteBill({ billId: this.billInfo._id }).then(() => {

						uni.showToast({ title: `已删除`, icon: 'none' });

						setTimeout(() => {

							// 通知首页刷新
							uni.$emit('billDeleted', {});

							uni.navigateBack();

						}, 500);

					});

				}

			});

		}
	},
	onLoad({ billId }) {

		uni.showLoading({ title: '加载中' });

		checkForPageLoad().then(() => {

			getBillByBillId({
				billId
			}).then(({ bill }) => {

				uni.setNavigationBarTitle({
					title: bill.billType === 'expenses' ? '支出' : '收入'
				});

				this.billInfo = bill;

				this.tagName = bill.tagId[0].tagName;
				this.tagIcon = bill.tagId[0].selectTagIcon;
				this.billTime = moment(bill.billTime).format('YYYY年MM月DD日');
				this.amount = ((bill.billType === 'expenses' ? bill.expensesAmount : bill.incomeAmount) / 100).toFixed(2);

				this.firstLoading = false;

				setTimeout(() => {

					uni.hideLoading();

				}, 200);

			});

		});

	},
	onShareAppMessage() {

		return {
			title: '欢迎进入花花记账本~',
			path: '/pages/index/index',
			imageUrl: '/static/images/share.jpg'
		};

	}
};
</script>

<style lang="scss">
page {
	background: #ededed;
}

.container {
	background: #ffffff;
	margin: 30rpx;
	padding: 50rpx 30rpx;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.tag-content {
		display: flex;
		align-items: center;

		.tag-icon {
			width: 70rpx;
			height: 70rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f7f7f7;

			image {
				width: 40rpx;
				height: 40rpx;
			}

		}

		.tag-icon-expenses {
			background: $canbin-expenses-color;
		}

		.tag-icon-income {
			background: $canbin-income-color;
		}

		.tag-name {
			width: 100rpx;
			margin-left: 20rpx;
			font-size: 36rpx;
		}
	}

	.amount {
		margin-top: 30rpx;
		margin-bottom: 40rpx;
		font-size: 70rpx;
		height: 80rpx;
		display: flex;
		align-items: center;

		text {
			margin-top: -8rpx;
			margin-right: 10rpx;
		}
	}

	.cell {
		width: 100%;
		display: flex;
		margin: 10rpx;
		padding: 0 30rpx;

		.label {
			width: 180rpx;
			color: #8e8e8e;
			font-size: 30rpx;
		}

		.value {
			width: 400rpx;
		}

	}

	.button-content {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 30rpx;
		border-top: 1px solid #e3e3e3;
		padding-top: 35rpx;

		.button {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 300rpx;
			font-size: 30rpx;
			background: #ffffff;

			image {
				width: 40rpx;
				height: 40rpx;
				margin-right: 20rpx;
			}

			.delete {
				color: #cd6661;
			}

		}

		.button-delete {
			border-right: 1px solid #e3e3e3;
		}

	}

}

.button-hover {
	opacity: 0.8;
}
</style>

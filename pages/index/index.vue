<template>
	<view v-if="!firstLoading" class="container">

		<view class="header">

			<view class="statistics-time-content"
				hover-class="select-hover"
				hover-stay-time="100"
				@click="onOpenStatisticsTimePicker">

				<view v-show="statisticsMonthTime != ''" class="statistics-time">

					{{ formatMonth(statisticsMonthTime) }}

				</view>

				<view v-show="statisticsYearTime != ''" class="statistics-time">

					{{ statisticsYearTime }}年

				</view>

				<image class="statistics-time-down" src='../../static/images/down_white.png' />

			</view>

			<view class="operation-content">

				<view class="operation-item"
					hover-class="select-hover"
					hover-stay-time="100"
					@click="onOpenBillTagPicker">

					<image class="icon" src='../../static/images/more.png' />

					<text v-if="selectTagId == ''">全部类型</text>

					<text v-else-if="selectTagId == 'allExpenses'">全部支出</text>

					<text v-else-if="selectTagId == 'allIncome'">全部收入</text>

					<text v-else>{{ tagName(selectTagId) }}</text>

				</view>

			</view>

		</view>

		<view class="temp-content" />

		<view v-show="showInfo" class="info-content">

			<view>

				<text v-show="statisticsMonthTime != ''" class="label">月支出</text>
				<text v-show="statisticsYearTime != ''" class="label">年支出</text>
				<text class="value">{{ formatAmount(totalExpenses) }}</text>

				<text v-show="statisticsMonthTime != ''" class="label">月收入</text>
				<text v-show="statisticsYearTime != ''" class="label">年收入</text>
				<text class="value">{{ formatAmount(totalIncome) }}</text>

			</view>

			<image class="avatar" :src="avatar || defaultAvatar" @click="onAvatarClick" />

		</view>

		<view class="list-content">

			<view class="statistics-content">

				<view>

					<view class="statistics-item">

						<view :class="[
							{ 'total-statistics': true },
							{ 'total-expenses': formatTotalAmount(totalExpenses, totalIncome) < 0 },
							{ 'total-income': formatTotalAmount(totalExpenses, totalIncome) > 0 },
						]">

							<text class="yuan">¥</text>
							<text v-show="formatTotalAmount(totalExpenses, totalIncome) < 0">-</text>
							<text v-show="formatTotalAmount(totalExpenses, totalIncome) > 0">+</text>
							{{ Math.abs(formatTotalAmount(totalExpenses, totalIncome)).toFixed(2) }}

						</view>

					</view>

					<view class="statistics-info">

						<text v-show="statisticsMonthTime != ''" class="label">月支出</text>
						<text v-show="statisticsYearTime != ''" class="label">年支出</text>
						<text class="value">{{ formatAmount(totalExpenses) }}</text>

						<text v-show="statisticsMonthTime != ''" class="label">月收入</text>
						<text v-show="statisticsYearTime != ''" class="label">年收入</text>
						<text class="value">{{ formatAmount(totalIncome) }}</text>

					</view>

				</view>

				<image class="avatar" :src="avatar || defaultAvatar" @click="onAvatarClick" />

			</view>

			<view class="bill-statistics">

				<view class="bill-statistics-item"
					v-for="statistics in list"
					:key="statistics.billTime">

					<view class="bill-info">

						<view class="bill-date">

							<text>{{ formatDay(statistics.billTime) }}</text>

							<text class="bill-weekday">{{ formatWeekday(statistics.billTime) }}</text>

						</view>

						<view class="bill-amount">

							<text class="bill-expenses">支出</text>

							<text class="bill-amount-number">{{ formatAmount(statistics.totalExpensesAmount) }}</text>

							<text class="bill-income">收入</text>

							<text class="bill-amount-number">{{ formatAmount(statistics.totalIncomeAmount) }}</text>

						</view>

					</view>

					<view v-for="bill in statistics.billList"
						:key="bill._id"
						style="margin: 0rpx 30rpx;">

						<van-swipe-cell right-width="140">

							<view class="bill-item"
								hover-class="view-hover"
								hover-stay-time="100"
								@click="onBillItemClick({ billId: bill._id })">

								<view :class="bill.billType === 'expenses' ? 'bill-icon-expenses' : 'bill-icon-income'">

									<image :src="bill.tagId[0].selectTagIcon" />

								</view>

								<view class="bill-item-content">

									<view class="bill-tag">{{ bill.tagId[0].tagName }}</view>

									<view v-if="bill.remark" class="bill-remark">{{ bill.remark }}</view>

								</view>

								<view class="bill-item-amount">

									<text v-if="bill.billType === 'expenses'" class="bill-expenses-text">

										- {{ formatAmount(bill.expensesAmount) }}

									</text>

									<text v-if="bill.billType === 'income'" class="bill-income-text">

										+ {{ formatAmount(bill.incomeAmount) }}

									</text>

								</view>

							</view>

							<view class="swipe-right" slot="right">

								<view class="swipe-item swipe-edit"
									@click="onEditBillButtonClick({ billId: bill._id })">
									编辑
								</view>

								<view class="swipe-item swipe-delete"
									@click="onDeleteBillButtonClick({ billId: bill._id })">
									删除
								</view>

							</view>

						</van-swipe-cell>

					</view>

				</view>

				<view v-if="pageStatus === 'noMore' && list.length === 0" class="no-data">

					<image src="../../static/images/no_more.svg" />

					<text>暂无账单，快去记一笔吧^-^</text>

				</view>

				<uni-load-more
					v-if="list.length !== 0"
					:status="pageStatus"
					:contentText="loadMoreContent" />

			</view>

		</view>

		<view class="bookkeeping-button"
			hover-class="view-hover"
			hover-stay-time="100"
			@click="onBookkeepingButtonClick">

			<image class="bookkeeping-icon" src="../../static/images/bookkeeping.png" />

			<view class="bookkeeping-text">记一笔</view>

		</view>

		<van-popup
			:show="showStatisticsTimePicker"
			position="bottom"
			round
			closeable
			:safe-area-inset-bottom="false"
			custom-style="height: 400px"
			@close="onCloseStatisticsTimePicker">

			<statistics-time-picker
				:mode="statisticsMode"
				:year-time="statisticsYearTime"
				:month-time="statisticsMonthTime"
				@modeChange="onStatisticsModeChange"
				@itemClick="onStatisticsItemClick" />

		</van-popup>

		<van-popup
			:show="showBillTagPicker"
			position="bottom"
			round
			closeable
			:safe-area-inset-bottom="false"
			custom-style="height: 450px"
			@close="onCloseBillTagPicker">

			<bill-tag-picker
				:select-tag-id="selectTagId"
				:tag-list="tags"
				@itemClick="onTagItemClick" />

		</van-popup>

		<!-- 用于解决ios的一个Bug -->
		<view style="height: 1px" />

	</view>
</template>

<script>

import _ from 'lodash';
import moment from 'moment';
import { defaultPageSize } from '../../constant';
import { getWeekdayByDay, getSearchTimeRange, rpx2px } from '../../util';
import { getBillStatisticsInfo, getBillList, deleteBill } from '../../service/bill';
import { checkForPageLoad } from '../../common';
import store from '../../store';

import StatisticsTimePicker from '../../components/statistics-time-picker';
import BillTagPicker from '../../components/bill-tag-picker';

export default {
	data() {
		return {
			firstLoading: true,
			defaultAvatar: '../../static/images/avatar.png',

			list: [],
			pageSize: defaultPageSize,
			pageStatus: '',	 							// loading/more/noMore
			loadMoreContent: {
				contentdown: "上拉显示更多",
				contentrefresh: "正在加载...",
				contentnomore: "没有更多数据了，快去记一笔吧^-^"
			},

			statisticsYearTime: '',
			statisticsMonthTime: moment().format('YYYY-MM'),
			statisticsMode: 'month',
			showStatisticsTimePicker: false,

			totalExpenses: 0,
			totalIncome: 0,

			showBillTagPicker: false,
			selectTagId: '',
			tags: [],

			scrollTopHeight: 0,
			showInfo: false
		};
	},
	components: {
		StatisticsTimePicker,
		BillTagPicker
	},
	computed: {
		avatar() {

			return store.state.avatar;

		},
		formatMonth() {

			return (time) => moment(time).format('YYYY年MM月');

		},
		formatDay() {

			return (time) => moment(time).format('MM月DD日');

		},
		formatWeekday() {

			return (time) => getWeekdayByDay({ day: moment(time).day() });

		},
		tagName() {

			return (tagId) => _.filter(getApp().globalData.tags, { '_id': tagId })[0].tagName;

		},
		formatAmount() {

			return (amount) => (amount / 100).toFixed(2);

		},
		formatTotalAmount() {

			return (expenses, income) => ((income - expenses) / 100).toFixed(2);

		}
	},
	methods: {
		onOpenBillTagPicker() {

			this.showBillTagPicker = true;

		},
		onCloseBillTagPicker() {

			this.showBillTagPicker = false;

		},
		onTagItemClick({ tagId }) {

			this.showBillTagPicker = false;
			this.selectTagId = tagId;

			this.afterOperation();

		},

		onOpenStatisticsTimePicker() {

			this.showStatisticsTimePicker = true;

		},
		onCloseStatisticsTimePicker() {

			this.showStatisticsTimePicker = false;

		},
		onStatisticsModeChange({ name }) {

			this.statisticsMode = name;

		},
		onStatisticsItemClick({ time }) {

			if (this.statisticsMode === 'month') {

				this.statisticsYearTime = '';
				this.statisticsMonthTime = time;

			} else if (this.statisticsMode === 'year') {

				this.statisticsYearTime = time;
				this.statisticsMonthTime = '';

			}

			this.showStatisticsTimePicker = false;

			uni.showLoading({ title: '加载中' });

			this.pageStatus = '';

			this.getStatistics();

			this.queryList().then(() => {

				uni.hideLoading();

			});

		},

		onBillItemClick({ billId }) {

			uni.navigateTo({
				url: `/pages/detail/index?billId=${billId}`
			});

		},
		onEditBillButtonClick({ billId }) {

			uni.navigateTo({
				url: `/pages/bookkeeping/index?operation=edit&billId=${billId}`
			});

		},
		onDeleteBillButtonClick({ billId }) {

			uni.showModal({
				title: '提示',
				content: '删除后无法恢复，是否删除？',
				showCancel: true,
			}).then(({ confirm }) => {

				if (confirm) {

					deleteBill({ billId }).then(() => {

						uni.showToast({ title: `已删除`, icon: 'none' });

						this.afterOperation();

					});

				}

			});

		},
		onBookkeepingButtonClick() {

			uni.navigateTo({
				url: '/pages/bookkeeping/index?operation=create'
			});

		},
		onAvatarClick() {

			uni.navigateTo({
				url: '/pages/userInfo/index'
			});

		},

		queryList() {

			if (this.pageStatus === 'noMore') {

				return Promise.resolve();

			}

			let skipSize;

			// 默认为刷新，所以从0开始
			if (this.pageStatus === '') {

				skipSize = 0;

			} else if (this.pageStatus === 'more') {

				this.pageStatus = 'loading';

				skipSize = _.reduce(this.list, (meme, item) => meme + item.billList.length, 0);

			}

			const {
				startTime,
				endTime
			} = getSearchTimeRange({
				statisticsMode: this.statisticsMode,
				statisticsMonthTime: this.statisticsMonthTime,
				statisticsYearTime: this.statisticsYearTime
			});

			return getBillList({
				userId: getApp().globalData.userId,
				tagId: this.selectTagId,
				skipSize,
				pageSize: this.pageSize,
				startTime,
				endTime
			}).then((result) => {

				// 如果没有数据了
				if (result.length === 0) {

					this.pageStatus = 'noMore';

					if (skipSize === 0) {

						this.list = [];

					}

				} else {

					// 相当于从头开始请求
					if (skipSize === 0) {

						this.list = _.cloneDeep(result);

					} else {

						let oldList = _.cloneDeep(this.list);

						let oldListEndIndex = oldList.length - 1;

						// 判断每一个请求回来的数据
						_.each(result, (item, index) => {

							if (index === 0 && item.billTime === oldList[oldListEndIndex].billTime) {

								oldList[oldListEndIndex].billList = _.concat(oldList[oldListEndIndex].billList, item.billList);

							} else {

								oldList = _.concat(oldList, item);

							}

						});

						this.list = _.cloneDeep(oldList);

					}

					const resultListLength = _.reduce(result, (meme, item) => meme + item.billList.length, 0);

					if (resultListLength < defaultPageSize) {

						this.pageStatus = 'noMore';

					} else {

						this.pageStatus = 'more';

					}

				}

			});

		},
		afterOperation() {

			uni.showLoading({ title: '加载中' });

			this.pageStatus = '';

			this.getStatistics();

			// 改变请求列表的长度
			// 1、如果列表长度 < defaultPageSize，使用defaultPageSize
			// 2、如果列表长度 >= defaultPageSize，使用列表长度
			let listLength = _.reduce(this.list, (meme, item) => meme + item.billList.length, 0);

			this.pageSize = listLength < defaultPageSize ? defaultPageSize : listLength;

			this.queryList().then(() => {

				uni.hideLoading();

				// 请求列表长度改为默认值
				this.pageSize = defaultPageSize;

			});

		},
		getStatistics() {

			const {
				startTime,
				endTime
			} = getSearchTimeRange({
				statisticsMode: this.statisticsMode,
				statisticsMonthTime: this.statisticsMonthTime,
				statisticsYearTime: this.statisticsYearTime
			});

			getBillStatisticsInfo({
				userId: getApp().globalData.userId,
				tagId: this.selectTagId,
				startTime,
				endTime
			}).then(({ data }) => {

				if (data.length > 0) {

					this.totalExpenses = data[0].totalExpensesAmount;
					this.totalIncome = data[0].totalIncomeAmount;

				} else {

					this.totalExpenses = 0;
					this.totalIncome = 0;

				}

			});

		}
	},
	onLoad() {

		this.scrollTopHeight = rpx2px({ rpx: 80 });

		uni.showLoading({ title: '加载中' });

		checkForPageLoad().then(() => {

			this.getStatistics();

			this.queryList().then(() => {

				this.firstLoading = false;

				uni.hideLoading();

			});

			this.tags = _.groupBy(getApp().globalData.tags, item => item.tagType);

			// 监听: 新建账单后
			uni.$on('billCreated', () => this.afterOperation());

			// 监听: 更新账单后
			uni.$on('billUpdated', () => this.afterOperation());

			// 监听: 删除账单后
			uni.$on('billDeleted', () => this.afterOperation());

		});

	},
	onPullDownRefresh() {

		uni.showLoading({ title: '加载中' });

		this.pageStatus = '';

		this.getStatistics();

		this.queryList().then(() => {

			uni.hideLoading();

			uni.stopPullDownRefresh();

		});

	},
	onReachBottom() {

		this.queryList();

	},
	onPageScroll(e) {

		if (e.scrollTop >= this.scrollTopHeight) {

			this.showInfo = true;

		} else {

			this.showInfo = false;

		}

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

.header {
	position: fixed;
	z-index: 30;
	width: 100%;
	top: 0;
	left: 0;
	background: $canbin-expenses-color;
	color: #ffffff;
	height: 80rpx;
	padding: 0 40rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;

	.statistics-time-content {
		display: flex;
		align-items: center;

		.statistics-time {
			font-size: 35rpx;
		}

		.statistics-time-down {
			width: 35rpx;
			height: 35rpx;
			margin-left: 5rpx;
		}

	}

	.operation-content {
		display: flex;
		align-items: center;

		.operation-item {
			display: flex;
			align-items: center;

			.icon {
				width: 32rpx;
				height: 32rpx;
				margin-right: 10rpx;
			}

			text {
				font-size: 28rpx;
			}

		}

	}

}

.temp-content {
	position: fixed;
	z-index: 10;
	left: 0;
	top: 80rpx;
	width: 100%;
	height: 80rpx;
	background: $canbin-expenses-color;
}

.info-content {
	position: fixed;
	z-index: 30;
	left: 0;
	top: 80rpx;
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 40rpx;
	background: #fff;
	border-bottom: 1px solid #eaeaea;
	font-size: 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;

	.label {
		color: #8e8e8e;
		margin-right: 20rpx;
	}

	.value {
		font-weight: bold;
		margin-right: 50rpx;
	}

	.avatar {
		width: 55rpx;
		height: 55rpx;
		border-radius: 100%;
	}

}

.list-content {
	position: relative;
	z-index: 20;
	margin-top: 80rpx;

	.statistics-content {
		margin: 20rpx;
		height: 160rpx;
		background: #ffffff;
		border: 1px solid #ececec;
		border-radius: 15rpx;
		padding: 25rpx 35rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.statistics-item {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.total-statistics {
				font-size: 50rpx;
				font-weight: bold;

				.yuan {
					margin-right: 30rpx;
				}

			}

			.total-expenses {
				color: $canbin-expenses-color;
			}

			.total-income {
				color: $canbin-income-color
			}

		}

		.statistics-info {
			margin-top: 20rpx;
			font-size: 28rpx;

			.label {
				color: #8e8e8e;
				margin-right: 10rpx;
			}

			.value {
				font-weight: bold;
				margin-right: 30rpx;
			}

		}

		.avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 100%;
		}

	}

	.bill-statistics {
		position: relative;
		z-index: 99;
		margin-bottom: 20rpx;

		.bill-statistics-item {
			background: #ffffff;
			margin: 20rpx;
			padding-bottom: 20rpx;
			border-radius: 15rpx;
			overflow: hidden;

			.bill-info {
				background: #fbfbfb;
				padding: 25rpx 40rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.bill-date {

					font-size: 30rpx;

					.bill-weekday {
						margin-left: 10rpx;
					}

				}

				.bill-amount {
					font-size: 26rpx;
					font-weight: bold;

					.bill-expenses {
						margin-right: 10rpx;
						color: #8e8e8e;
					}

					.bill-income {
						margin-left: 20rpx;
						margin-right: 10rpx;
						color: #8e8e8e;
					}

					.bill-amount-number {
						font-weight: bold;
					}

				}

			}

			.bill-item {
				display: flex;
				align-items: center;
				padding: 25rpx;
				border-bottom: 1px solid #ececec;

				.bill-icon-expenses {
					background: $canbin-expenses-color;
					width: 70rpx;
					height: 70rpx;
					border-radius: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					image {
						width: 45rpx;
						height: 45rpx;
					}

				}

				.bill-icon-income {
					background: $canbin-income-color;
					width: 70rpx;
					height: 70rpx;
					border-radius: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					image {
						width: 45rpx;
						height: 45rpx;
					}

				}

				.bill-item-content {
					margin-left: 30rpx;
					flex-grow: 1;

					.bill-tag {
						font-size: 30rpx;
					}

					.bill-remark {
						width: 300rpx;
						font-size: 26rpx;
						color: #7e7e7e;
						margin-top: 5rpx;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

				}

				.bill-item-amount {
					font-weight: bold;
					font-size: 34rpx;
					flex-shrink: 0;

					.bill-expenses-text {
						color: $canbin-expenses-color;
					}

					.bill-income-text {
						color: $canbin-income-color;
					}

				}

			}

			.swipe-right {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 140px;
				height: 100%;
				font-size: 30rpx;

				.swipe-item {
					height: 100%;
					color: #ffffff;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.swipe-edit {
					width: 70px;
					background-color: #4c4c4c;
				}

				.swipe-delete {
					width: 70px;
					background-color: #E75E58;
				}

			}

		}

		.no-data {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			image {
				width: 200rpx;
				height: 200rpx;
			}

			text {
				font-size: 30rpx;
				margin-top: 10rpx;
			}

		}

	}
}

.bookkeeping-button {
	position: fixed;
	z-index: 100;
	right: 40rpx;
	bottom: 40rpx;
	box-shadow: rgba(0, 0, 0, 0.15) 0px 5rpx 15rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx 30rpx;
	background: #ffffff;
	border-radius: 100rpx;

	.bookkeeping-icon {
		width: 40rpx;
		height: 40rpx;
	}

	.bookkeeping-text {
		color: $canbin-expenses-color;
		font-size: 28rpx;
		margin-left: 10rpx;
	}

}

.view-hover {
	background: #f7f7f7;
}

.select-hover {
	opacity: 0.8;
}
</style>

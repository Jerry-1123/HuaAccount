<template>
	<view class="container">

		<view :class="[
			{ 'header': true },
			{ 'header-expenses': selectTabIndex === 0 && selectTabIndex !== 1 },
			{ 'header-income': selectTabIndex === 1 && selectTabIndex !== 0 }
		]">

			<view class="operation-content">

				<view class="time-content"
					hover-class="select-hover"
					hover-stay-time="100"
					@click="onOpenStatisticsTimePicker">

					<text v-show="statisticsMonthTime != ''">{{ formatMonth(statisticsMonthTime) }}</text>

					<text v-show="statisticsYearTime != ''">{{ statisticsYearTime }}年</text>

					<image class="statistics-time-down" src='../../static/images/down_white.png' />

				</view>

				<view class="tab-content">

					<view v-for="(item, index) in tabs"
						:key="item.value"
						:class="[
							{ 'tab': true },
							{ 'tab-expenses': selectTabIndex === 0 && index !== 1 },
							{ 'tab-income': selectTabIndex === 1 && index !== 0 }
						]"
						@click="onTabItemClick({ index })">

						{{ item.label }}

					</view>

				</view>

			</view>

			<view class="amount-content">

				<text class="label">{{ selectTabIndex === 0 ? '共支出' : '共收入' }}</text>

				<text class="value">

					¥ {{ selectTabIndex === 0 ? formatAmount(totalExpenses) : formatAmount(totalIncome) }}

				</text>

			</view>

		</view>

		<view class="structure" v-if="billList.length > 0">

			<view class="title">

				{{ selectTabIndex === 0 ? '支出' : '收入' }}构成

			</view>

			<view class="chart">

				<qiun-data-charts
					id="pie-chart"
					type="ring"
					:loadingType="0"
					:canvas2d="true"
					:tooltipShow="false"
					:opts="pieChartOpts"
					:chartData="pieChartData" />

			</view>

			<view class="list">

				<view v-for="item in pieList"
					:key="item.tagId[0]._id"
					class="list-item"
					hover-class="select-hover"
					hover-stay-time="100">

					<view :class="[
						{ 'icon': true },
						{ 'icon-expenses': selectTabIndex === 0 },
						{ 'icon-income': selectTabIndex === 1 }
					]">

						<image :src="item.tagId[0].selectTagIcon" />

					</view>

					<view class="wrap">

						<view class="wrap-top">

							<view class="tag-name">{{ item.tagId[0].tagName }}</view>

							<view class="total">{{ item.totalCount }}笔</view>

						</view>

						<view class="wrap-bottom">

							<van-progress
								:percentage="item.percent"
								:show-pivot="false"
								:color="selectTabIndex === 0 ? '#3eb575' : '#f0b73a'"
								stroke-width="5"
								track-color="#ffffff" />

						</view>

					</view>

					<view class="amount">

						<text>{{ selectTabIndex === 0 ? '-' : '+' }}</text>

						<text>{{ item.amount }}</text>

						<image src="../../static/images/right_gray.png" />

					</view>

				</view>

				<view v-if="showExpand && pieData.length >= 5"
					class="expand"
					hover-class="select-hover"
					hover-stay-time="100"
					@click="onClickExpand">

					展开更多

					<image src="../../static/images/down_gray.png" />

				</view>

				<view v-if="!showExpand && pieData.length >= 5"
					class="expand"
					hover-class="select-hover"
					hover-stay-time="100"
					@click="onClickExpand">

					收起

					<image src="../../static/images/up_gray.png" />

				</view>

			</view>

		</view>

		<view class="divider" v-if="billList.length > 0" />

		<view class="no-data" v-if="billList.length === 0 && !isLoading">

			<image v-show="selectTabIndex === 0" src="../../static/images/no_more.svg" />

			<image v-show="selectTabIndex === 1" src="../../static/images/no_more_income.svg" />

			<text>暂无账单，快去记一笔吧^-^</text>

		</view>

		<view class="structure" v-if="billList.length > 0" style="display: none">

			<view class="title">
				{{ statisticsMode === 'month' ? '每日对比' : '每月对比' }}
			</view>

			<view class="chart">

				<qiun-data-charts
					id="line-chart"
					type="column"
					:loadingType="0"
					:canvas2d="true"
					:tooltipShow="false"
					:opts="lineChartOpts"
					:chartData="lineChartData" />

			</view>

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
				@modeChange='onStatisticsModeChange'
				@itemClick='onStatisticsItemClick' />

		</van-popup>

		<!-- 用于解决ios的一个Bug -->
		<view style="height: 1px" />

	</view>
</template>

<script>

import _ from 'lodash';
import moment from 'moment';
import {
	getSearchTimeRange,
	getExpensesColors,
	getIncomeColors
} from '../../util';
import {
	getBillStatisticsInfo,
	getBillStatisticsInfoGroupByTag,
	getBillStatisticsInfoGroupByDay,
	getBillStatisticsInfoGroupByMonth,
	getBillListOrderByAmount
} from '../../service/bill';
import { checkForPageLoad } from '../../common';

import StatisticsTimePicker from '../../components/statistics-time-picker';

export default {
	data() {
		return {
			statisticsYearTime: '',
			statisticsMonthTime: moment().format('YYYY-MM'),
			statisticsMode: 'month',
			showStatisticsTimePicker: false,

			tabs: [{ label: '支出', value: 'expenses' }, { label: '收入', value: 'income' }],
			selectTabIndex: 0,
			totalExpenses: 0,
			totalIncome: 0,

			showExpand: true,
			pieData: [],
			pieChartData: {},
			pieChartOpts: {
				color: getExpensesColors()
			},

			lineData: [],
			lineChartData: {},
			lineChartOpts: {},

			billList: [],
			isLoading: false
		};
	},
	components: {
		StatisticsTimePicker
	},
	computed: {
		formatMonth() {

			return (time) => moment(time).format('YYYY年MM月');

		},
		formatAmount() {

			return (amount) => (amount / 100).toFixed(2);

		},
		pieList() {

			if (!this.showExpand) {

				return this.pieData;

			} else {

				if (this.pieData.length < 5) {

					return this.pieData;

				} else {

					return this.pieData.slice(0, 5);

				}

			}

		}
	},
	methods: {
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

			this.getStatistics();

		},
		onTabItemClick({ index }) {

			this.selectTabIndex = index;

			if (index === 0) {

				uni.setNavigationBarColor({
					frontColor: '#ffffff',
					backgroundColor: '#3eb575'
				});

				uni.setBackgroundColor({
					backgroundColorTop: '#3eb575'
				});

				this.pieChartOpts = {
					color: getExpensesColors()
				};

			} else {

				uni.setNavigationBarColor({
					frontColor: '#ffffff',
					backgroundColor: '#f0b73a'
				});

				uni.setBackgroundColor({
					backgroundColorTop: '#f0b73a'
				});

				this.pieChartOpts = {
					color: getIncomeColors()
				};

			}

			this.showExpand = true;

			this.getStatistics();

		},
		onClickExpand() {
			this.showExpand = !this.showExpand;
		},

		getStatistics() {

			uni.showLoading({ title: '加载中' });

			this.isLoading = true;

			this.billList = [];

			const {
				startTime,
				endTime
			} = getSearchTimeRange({
				statisticsMode: this.statisticsMode,
				statisticsMonthTime: this.statisticsMonthTime,
				statisticsYearTime: this.statisticsYearTime
			});

			const billType = this.tabs[this.selectTabIndex].value;
			const userId = getApp().globalData.userId;

			let promise1 = getBillStatisticsInfo({
				userId,
				tagId: '',
				startTime,
				endTime
			});

			let promise2 = getBillStatisticsInfoGroupByTag({
				billType,
				userId,
				startTime,
				endTime
			});

			let promise3 = null;

			if (this.statisticsMode === 'year') {

				promise3 = getBillStatisticsInfoGroupByMonth({
					billType,
					userId,
					startTime,
					endTime
				});

			} else {

				promise3 = getBillStatisticsInfoGroupByDay({
					billType,
					userId,
					startTime,
					endTime
				});

			}

			let promise4 = getBillListOrderByAmount({
				billType,
				userId,
				skipSize: 0,
				pageSize: 10,
				startTime,
				endTime
			});

			return Promise.all([
				promise1,
				promise2,
				promise3,
				promise4
			]).then(res => {

				// 顶部统计
				if (res[0].data.length > 0) {

					this.totalExpenses = res[0].data[0].totalExpensesAmount;
					this.totalIncome = res[0].data[0].totalIncomeAmount;

				}

				// 饼图
				if (res[1].data.length > 0) {

					let pieData = res[1].data;

					const maxAmount = _.maxBy(pieData, 'amount').amount;

					_.map(pieData, item => {

						let percent = Number((item.amount * 100 / maxAmount).toFixed(2));

						if (percent < 1) {

							percent = 1;

						}

						item.percent = percent;
						item.amount = (item.amount / 100).toFixed(2);

						return item;

					});

					this.pieData = pieData;

					this.pieChartData = {
						series: [
							{
								data: _.map(res[1].data, item => {

									return {
										name: item.tagId[0].tagName,
										value: Number((item.amount / 100).toFixed(2))
									};

								}),
								format: "customPieData"
							}
						]
					};

				}

				// 柱状图
				if (res[2].data.length > 0) {

					let lineData = res[2].data;

					console.log(lineData);

					this.lineChartData = {
						categories: ["2016", "2017", "2018", "2019", "2020", "2021"],
						series: [
							{
								data: [35, 36, 31, 33, 13, 34]
							}
						]
					};

				}

				// 前十数据
				this.billList = res[3].data;

				this.isLoading = false;

				uni.hideLoading();

			});

		}
	},
	onLoad() {

		checkForPageLoad().then(() => {

			this.getStatistics();

		});

		// 月统计：圆饼图、构成明细、按天柱状图、当月最高金额前10排行榜

		// 年统计：圆饼图、构成明细、按月柱状图、当年最高金额前10排行榜

	},
	onPullDownRefresh() {

		this.getStatistics().then(() => {

			uni.stopPullDownRefresh();

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
	background: #ffffff;
}

.container {

	.header {
		color: #ffffff;
		height: 160rpx;

		.operation-content {
			height: 80rpx;
			padding: 0 40rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.time-content {
				display: flex;
				align-items: center;

				text {
					font-size: 35rpx;
				}

				image {
					width: 35rpx;
					height: 35rpx;
					margin-left: 5rpx;
				}

			}

			.tab-content {
				display: flex;

				.tab {
					margin-left: 30rpx;
					padding: 10rpx 20rpx;
					color: #ffffff;
					border-radius: 3px;
				}

				.tab-expenses {
					background: #54c486;
				}

				.tab-income {
					background: rgb(241, 199, 61);
				}

			}
		}

		.amount-content {
			height: 80rpx;
			line-height: 80rpx;
			padding: 0 40rpx;

			.label {
				font-size: 30rpx;
			}

			.value {
				font-size: 40rpx;
				font-weight: bold;
			}
		}

	}

	.header-expenses {
		background: $canbin-expenses-color;
	}

	.header-income {
		background: $canbin-income-color;
	}

	.charts-content {
		width: 100%;
		height: 300px;
		position: relative;
		z-index: 1;
	}

	.structure {
		padding: 40rpx;

		.title {
			font-size: 32rpx;
		}

		.chart {
			padding: 20rpx 0;
			height: 450rpx;
		}

		.list {

			.list-item {
				display: flex;
				align-items: center;
				margin: 15rpx 0;

				.icon {
					flex-shrink: 0;
					width: 70rpx;
					height: 70rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					background: #f7f7f7;
					margin: 10rpx 0;

					image {
						width: 35rpx;
						height: 35rpx;
					}

				}

				.icon-expenses {
					background: $canbin-expenses-color;
				}

				.icon-income {
					background: $canbin-income-color;
				}

				.wrap {
					flex-grow: 1;
					margin: 0 30rpx;

					.wrap-top {
						display: flex;
						align-items: center;
						margin-bottom: 5rpx;

						.tag-name {
							font-size: 26rpx;
						}

						.total {
							font-size: 22rpx;
							color: #8e8e8e;
							margin-left: 20rpx;
						}

					}

					.wrap-bottom {}

				}

				.amount {
					font-size: 30rpx;
					flex-shrink: 0;
					display: flex;
					align-items: center;

					image {
						width: 30rpx;
						height: 30rpx;
						margin-left: 10rpx;
					}

				}

			}

			.expand {
				height: 44rpx;
				line-height: 44rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 28rpx;
				color: #8e8e8e;

				image {
					width: 34rpx;
					height: 34rpx;
					margin-left: 10rpx;
				}

			}

		}

	}

	.divider {
		height: 1px;
		background: #eaeaea;
		margin: 0 50rpx 50rpx;
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

.select-hover {
	opacity: 0.8;
}
</style>

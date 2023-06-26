<template>
	<view class="container">

		<view v-if="copyContent.length > 0" class="ranking">

			<view v-for="(content,index) in copyContent"
				:key="index"
				class="ranking-item">

				<view class="progress">
					<text :style="{
						background:content.background,
						width:content.width + '%',
						height:'24rpx'
					}" />
				</view>

			</view>

		</view>

	</view>
</template>

<script>

import _ from 'lodash';

export default {
	name: 'ranking-list',
	props: {
		content: {
			type: Array,
			default() {
				return [];
			}
		}
	},
	data() {
		return {
			progressWidth: 24,
			maxNumber: 0,
			culCount: 0,
			copyContent: []
		};
	},
	watch: {
		content() {
			this.init();
		}
	},
	methods: {
		init() {

			this.copyContent = _.cloneDeep(this.content);

			if (this.copyContent && this.copyContent.length > 0) {

				this.maxNumber = Math.max.apply(Math, this.copyContent.map(item => { return item.num; }));

				this.copyContent = _.map(this.copyContent, item => {

					item.width = this.computeWidth(this.maxNumber, item.num);

					return item;

				});

			}

		},
		computeWidth(max, current) {

			let num = (current / max) * 100;

			return num.toFixed(2);

		}
	},
	mounted() {
		this.init();
	}
};
</script>

<style scoped lang="scss">
.ranking-item {
	display: flex;
	margin-bottom: 13rpx;
	align-content: center;
	height: 28rpx;

	.name {
		padding-right: 10rpx;
		color: #868688;
		font-size: 20rpx;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.progress {
		flex: 5;
		text-align: left;
		padding-right: 10rpx;

		text {
			display: inline-block;
			border-radius: 30rpx;
			vertical-align: top;
		}

	}

	.num {
		font-size: 26rpx;
		color: #3EB2F5;
		flex: 1;
	}
}
</style>

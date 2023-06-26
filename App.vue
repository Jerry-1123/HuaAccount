<script>

import { checkForUpdateApp } from './common';

export default {
	globalData: {
		openId: null,
		userId: null,
		tags: null
	},
	onLaunch() {

		checkForUpdateApp();

	}
};
</script>

<style>
@import "/wxcomponents/vant/popup/index.wxss";
@import "/wxcomponents/vant/calendar/index.wxss";
@import "/wxcomponents/vant/swipe-cell/index.wxss";
@import "/wxcomponents/vant/datetime-picker/index.wxss";
@import "/wxcomponents/vant/tab/index.wxss";
@import "/wxcomponents/vant/tabs/index.wxss";
@import "/wxcomponents/vant/progress/index.wxss";
@import "/wxcomponents/vant/cell/index.wxss";
@import "/wxcomponents/vant/cell-group/index.wxss";

/*每个页面公共css */
.van-ellipsis {
	background: #fafafa !important;
	font-size: 32rpx !important;
}

view {
	display: block;
	box-sizing: border-box;
}
</style>

export const useCommon = () => {

    // 轻提示
    const showToast = (msg) => {

        uni.showToast({
            title: msg,
            icon: 'none'
        });

    };

    // rpx转化为px
    const rpx2px = (rpx) => {

        let deviceWidth = uni.getSystemInfoSync().windowWidth; //获取设备屏幕宽度

        let px = (deviceWidth / 750) * Number(rpx);

        return Math.floor(px);

    };

    return {
        showToast,
        rpx2px
    };

};
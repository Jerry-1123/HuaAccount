import { getOpenIdByCode } from '../service-cloud/user';
import { getUserByOpenId, createUser } from '../service/user';
import { getTags } from '../service/tag';
import store from '../store';

// 检查更新
export const checkForUpdateApp = () => {

    const updateManager = uni.getUpdateManager();

    updateManager.onUpdateReady(() => {

        uni.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: (res) => {

                if (res.confirm) {

                    updateManager.applyUpdate();

                }

            }

        });

    });

};

// 页面加载之前检查
export const checkForPageLoad = () => {

    let openId = uni.getStorageSync('openId') || getApp().globalData.openId;
    let userId = getApp().globalData.userId;
    let tags = getApp().globalData.tags;

    let promiseForOpenId = Promise.resolve({ openId });
    let promiseForTags = Promise.resolve({ tags });

    if (!openId) {
        promiseForOpenId = uni.login({ provider: 'weixin' }).then(({ code }) => getOpenIdByCode({ code }));
    }

    if (!tags) {
        promiseForTags = getTags();
    }

    return Promise.all([
        promiseForOpenId,
        promiseForTags
    ]).then(([
        { openId },
        { tags }
    ]) => {

        getApp().globalData.openId = openId;
        getApp().globalData.tags = tags;

        uni.setStorageSync('openId', openId);

        if (!userId) {

            return getUserByOpenId({ openId }).then(({ userInfo }) => {

                if (!userInfo) {

                    return createUser({ openId }).then(({ result: { id: userId } }) => {

                        getApp().globalData.userId = userId;

                        store.commit('setAvatar', '');
                        store.commit('setNickName', '');

                        return Promise.resolve();

                    });

                } else {

                    getApp().globalData.userId = userInfo._id;

                    store.commit('setAvatar', userInfo.avatarUrl);
                    store.commit('setNickName', userInfo.nickName);

                    return Promise.resolve();

                }

            });

        } else {

            return Promise.resolve();

        }

    });

};

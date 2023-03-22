
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { getOpenIdByCode } from '@/service-cloud/user';
import { getUserByOpenId, createUser } from '@/service/user';
import { getTags } from '@/service/tag';
import { getShareInfo } from '@/service/share';
import _ from 'lodash';

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

    const userStore = useUserStore();
    const appStore = useAppStore();

    const openId = uni.getStorageSync('openId');
    const { userId } = userStore;
    const { tags, shareInfo } = appStore;

    let promiseForOpenId = Promise.resolve({ openId });
    let promiseForTags = Promise.resolve({ tags });
    let promiseForShare = Promise.resolve({ shareInfo });

    if (!openId) {
        promiseForOpenId = uni.login({ provider: 'weixin' }).then(({ code }) => getOpenIdByCode({ code }));
    }

    if (tags.length === 0) {
        promiseForTags = getTags();
    }

    if (_.isEmpty(shareInfo)) {
        promiseForShare = getShareInfo();
    }

    return Promise.all([
        promiseForOpenId,
        promiseForTags,
        promiseForShare
    ]).then(([
        { openId },
        { tags },
        { shareInfo }
    ]) => {

        appStore.$patch((state) => {
            state.tags = tags;
            state.shareInfo = shareInfo;
        });

        uni.setStorageSync('openId', openId);

        if (!userId) {

            return getUserByOpenId({ openId }).then(({ userInfo }) => {

                if (!userInfo) {

                    return createUser({ openId }).then(({ result: { id: userId } }) => {

                        userStore.$patch((state) => {
                            state.openId = openId;
                            state.userId = userId;
                            state.nickName = '';
                            state.avatar = '';
                        });

                        return Promise.resolve();

                    });

                } else {

                    userStore.$patch((state) => {
                        state.openId = openId;
                        state.userId = userInfo._id;
                        state.nickName = userInfo.nickName;
                        state.avatar = userInfo.avatarUrl;
                    });

                    return Promise.resolve();

                }

            });

        } else {

            return Promise.resolve();

        }

    });

};

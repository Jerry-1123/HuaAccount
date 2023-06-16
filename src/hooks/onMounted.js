import { onLoad } from "@dcloudio/uni-app";
import { useState } from '@/hooks/useState';
import { getOpenIdByCode } from '@/service-cloud/user';
import { getUserByOpenId, createUser } from '@/service/user';
import { getTags } from '@/service/tag';
import { getShareInfo } from '@/service/share';
import { shareInfoData } from '@/constant';
import _ from 'lodash';
import moment from "moment";

export const onMounted = (fucntion) => {

    const {
        setUserInfo,
        setAppInfo,
    } = useState();

    const checkForPageLoad = () => {

        const openId = uni.getStorageSync('openId');
        const userId = useState().userId.value;
        const tags = useState().tags.value;
        // const shareInfo = useState().shareInfo.value;
        const shareInfo = shareInfoData;

        let PromiseForOpenId = () => Promise.resolve({ openId });
        let PromiseForTags = () => Promise.resolve({ tags });
        let PromiseForShare = () => Promise.resolve({ shareInfo });

        if (!openId) {
            PromiseForOpenId = () => uni.login({ provider: 'weixin' }).then(({ code }) => getOpenIdByCode({ code }));
        }

        if (tags.length === 0) {
            PromiseForTags = () => getTags();
        }

        // if (_.isEmpty(shareInfo)) {
        //     PromiseForShare = () => getShareInfo();
        // }

        return Promise.all([
            PromiseForOpenId(),
            PromiseForTags(),
            PromiseForShare()
        ]).then(([
            { openId },
            { tags },
            { shareInfo }
        ]) => {

            setAppInfo({ tags, shareInfo });

            uni.setStorageSync('openId', openId);

            if (!userId) {

                return getUserByOpenId({ openId }).then(({ userInfo }) => {

                    if (!userInfo) {

                        return createUser({ openId }).then(({ userId, nickName }) => {

                            setUserInfo({
                                openId,
                                userId,
                                nickName,
                                avatar: '',
                                registerTime: moment().valueOf()
                            });

                            return Promise.resolve();

                        });

                    } else {

                        setUserInfo({
                            openId,
                            userId: userInfo._id,
                            nickName: userInfo.nickName,
                            avatar: userInfo.avatarUrl,
                            registerTime: userInfo.createTime
                        });

                        return Promise.resolve();

                    }

                });

            } else {

                return Promise.resolve();

            }

        });

    };

    onLoad((options) => {

        uni.showLoading({ title: '加载中', mask: true });

        checkForPageLoad().then(() => {

            fucntion(options);

        });

    });

};
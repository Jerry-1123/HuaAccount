import { onLoad } from "@dcloudio/uni-app";
import { useState } from '@/hooks/useState';
import { getOpenIdByCode } from '@/service-cloud/user';
import { getUserByOpenId, createUser } from '@/service/user';
import { getTags } from '@/service/tag';
import _ from 'lodash';
import moment from "moment";

export const onMounted = (fucntion, needLoading = true) => {

    const {
        setUserInfo,
        setTags
    } = useState();

    const checkForPageLoad = () => {

        const openId = uni.getStorageSync('openId');
        const userId = useState().userId.value;
        const tags = useState().tags.value;

        let PromiseForOpenId = () => Promise.resolve({ openId });
        let PromiseForTags = () => Promise.resolve({ tags });

        if (!openId) {
            PromiseForOpenId = () => uni.login({ provider: 'weixin' }).then(({ code }) => getOpenIdByCode({ code }));
        }

        if (tags.length === 0) {
            PromiseForTags = () => getTags();
        }

        return Promise.all([
            PromiseForOpenId(),
            PromiseForTags(),
        ]).then(([
            { openId },
            { tags },
        ]) => {

            setTags({ tags });

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

    onLoad((opts) => {

        if (needLoading) {

            uni.showLoading({ title: '加载中', mask: true });

        }

        checkForPageLoad().then(() => {

            fucntion(opts);

        });

    });

};
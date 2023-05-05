import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';

export const useState = () => {

    const userStore = useUserStore();
    const appStore = useAppStore();

    const {
        openId,
        userId,
        nickName,
        avatar
    } = storeToRefs(userStore);

    const {
        tags,
        shareInfo,

        tagsList,
        tagsGroup,
        expenseTags,
        incomeTags,
        shareData
    } = storeToRefs(appStore);

    const setUserInfo = ({ openId, userId, nickName, avatar }) => {

        userStore.$patch((state) => {

            state.openId = openId;
            state.userId = userId;
            state.nickName = nickName;
            state.avatar = avatar;

        });

    };

    const setAppInfo = ({ tags, shareInfo }) => {

        appStore.$patch((state) => {
            state.tags = tags;
            state.shareInfo = shareInfo;
        });

    };

    const changeUserInfo = ({ nickName, avatar }) => {

        userStore.$patch((state) => {

            state.nickName = nickName;
            state.avatar = avatar;

        });

    };

    return {
        openId,
        userId,
        nickName,
        avatar,
        tags,
        shareInfo,
        tagsList,
        tagsGroup,
        expenseTags,
        incomeTags,
        shareData,

        setUserInfo,
        setAppInfo,
        changeUserInfo
    };

};
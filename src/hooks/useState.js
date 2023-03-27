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
        shareData
    };

};
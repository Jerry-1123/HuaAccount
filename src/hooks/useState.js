import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';

export const useState = () => {

    const userStore = useUserStore();
    const appStore = useAppStore();

    // state
    const {
        openId,
        userId,
        nickName,
        avatar,
        registerTime
    } = storeToRefs(userStore);

    // actions
    const {
        setUserInfo,
        changeUserInfo
    } = userStore;

    // state
    const {
        tags
    } = storeToRefs(appStore);

    // getters
    const {
        tagsList,
        tagsGroup,
        expenseTags,
        incomeTags,
    } = storeToRefs(appStore);

    // actions
    const {
        setTags
    } = appStore;

    return {
        // state
        openId,
        userId,
        nickName,
        avatar,
        registerTime,
        tags,

        // getters
        tagsList,
        tagsGroup,
        expenseTags,
        incomeTags,
        
        // actions
        setUserInfo,
        changeUserInfo,
        setTags
    };

};
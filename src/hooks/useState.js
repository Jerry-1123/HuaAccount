import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';

export const useState = () => {

    const userStore = useUserStore();
    const appStore = useAppStore();

    return {
        ...userStore,
        ...storeToRefs(userStore),
        ...appStore,
        ...storeToRefs(appStore)
    };

};
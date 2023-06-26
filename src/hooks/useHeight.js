import { ref } from 'vue';

export const useHeight = () => {

    const statusBarHeight = ref(0);
    const titleBarHeight = ref(0);
    const navigationBarHeight = ref(0);

    const capsule = uni.getMenuButtonBoundingClientRect();

    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight;
    titleBarHeight.value = (capsule.top - statusBarHeight.value) * 2 + capsule.height;
    navigationBarHeight.value = statusBarHeight.value + titleBarHeight.value;

    return {
        statusBarHeight,
        titleBarHeight,
        navigationBarHeight
    };

};

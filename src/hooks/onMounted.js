import { onLoad } from "@dcloudio/uni-app";
import { checkForPageLoad } from '@/common';

export const onMounted = (hook) => {

    onLoad((options) => {

        uni.showLoading({ title: '加载中' });

        checkForPageLoad().then(() => {

            hook(options);

        });

    });

};


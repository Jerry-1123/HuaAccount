import { onLoad } from "@dcloudio/uni-app";
import { useCommon } from "./useCommon";

export const onMounted = (fucntion) => {

    let { checkForPageLoad } = useCommon();

    onLoad((options) => {

        uni.showLoading({ title: '加载中' });

        checkForPageLoad().then(() => {

            fucntion(options);

        });

    });

};
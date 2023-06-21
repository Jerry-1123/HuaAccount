import { onShareAppMessage as onShareApp } from "@dcloudio/uni-app";
import { shareInfoData } from '@/constant';

export const onShareAppMessage = () => onShareApp(() => {

    return shareInfoData;

});
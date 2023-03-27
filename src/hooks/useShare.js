import { onShareAppMessage } from "@dcloudio/uni-app";
import { useState } from "./useState";

export const useShare = () => {

    const shareApp = () => onShareAppMessage(() => {

        const { shareData } = useState();

        return shareData.value;

    });

    return {
        onShareAppMessage: shareApp
    };

};

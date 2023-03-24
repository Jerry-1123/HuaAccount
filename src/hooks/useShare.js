import { onShareAppMessage } from "@dcloudio/uni-app";
import { useState } from "./useState";

export const useShare = () => {

    const { shareData } = useState();

    const shareApp = () => {

        onShareAppMessage(() => {

            return shareData.value;

        });

    };

    return {
        onShareAppMessage: shareApp
    };

};

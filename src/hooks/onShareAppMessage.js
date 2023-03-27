import { onShareAppMessage as onShareApp } from "@dcloudio/uni-app";
import { useState } from "./useState";

export const onShareAppMessage = () => onShareApp(() => {

    const { shareData } = useState();

    return shareData.value;

});
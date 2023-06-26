import { onShareAppMessage as onShareApp } from "@dcloudio/uni-app";

export const onShareAppMessage = () => onShareApp(() => {

    return {
        title: '欢迎来到花花记账本~',
        path: '/pages/index/index',
        imageUrl: 'https://mp-9f46008e-93c5-4337-83cd-181660899272.cdn.bspapp.com/cloudstorage/8c7301f1-aad4-4140-bd8b-3f0a89a67755.jpg'
    };

});
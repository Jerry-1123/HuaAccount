import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        openId: '',
        userId: '',
        nickName: '',
        avatar: '',
        registerTime: ''
    }),
    getters: {},
    actions: {
        setUserInfo({ openId, userId, nickName, avatar, registerTime }) {

            this.$patch({
                openId,
                userId,
                nickName,
                avatar,
                registerTime
            });

        },
        changeUserInfo({ nickName, avatar }) {

            this.$patch({
                nickName,
                avatar
            });

        }
    }
});
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
    actions: {}
});
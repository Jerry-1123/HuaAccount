import { createStore } from "vuex";

const store = createStore({
	state: {
		avatar: '',
		nickName: ''
	},
	mutations: {
		setAvatar(state, avatar) {
			state.avatar = avatar;
		},
		setNickName(state, nickName) {
			state.nickName = nickName;
		}
	}
});

export default store;

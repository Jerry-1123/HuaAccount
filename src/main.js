import { createSSRApp } from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import '@/styles/common.scss';

export function createApp() {

	const app = createSSRApp(App);
	const pinia = createPinia();

	app.use(pinia);

	return {
		app
	};

}

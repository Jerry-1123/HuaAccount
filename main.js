import App from './App';
import store from './store';
import moment from 'moment';

moment.locale('zh-cn');

// #ifndef VUE3
import Vue from 'vue';
Vue.config.productionTip = false;
App.mpType = 'app';
const app = new Vue({
  store,
  ...App
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
export function createApp() {
  const app = createSSRApp(App);
  app.use(store);
  return {
    app
  };
}
// #endif
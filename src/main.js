import Vue from 'vue'
import App from './App.vue'
import router from './router'
import fabric from "fabric";
Vue.use(fabric);
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
import './assets/styles/iconfont/iconfont.css'


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

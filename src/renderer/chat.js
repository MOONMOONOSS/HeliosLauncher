import Vue from 'vue';

import App from './App';
import router from './router-launcher';
import store from './store-launcher';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

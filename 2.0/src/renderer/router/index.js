import Vue from 'vue';
import Router from 'vue-router';

import Login from '@/components/Login';
import Welcome from '@/components/Welcome';
import Whitelist from '@/components/Whitelist';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'welcome-page',
      component: Welcome,
    },
    {
      path: '/login',
      name: 'minecraft-login',
      component: Login,
    },
    {
      path: '/whitelist',
      name: 'whitelisting',
      component: Whitelist,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

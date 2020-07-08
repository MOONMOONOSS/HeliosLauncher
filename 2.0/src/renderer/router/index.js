import Vue from 'vue';
import Router from 'vue-router';

import Landing from '@/components/Landing';
import Login from '@/components/Login';
import Welcome from '@/components/Welcome';
import Whitelist from '@/components/Whitelist';

import store from '../store/index';

function notMcAuthorized(to, from, next) {
  if (store.getters['Account/uuid']) {
    next({ name: 'whitelisting' });
  } else {
    next();
  }
}

function mcAuthorized(to, from, next) {
  if (store.getters['Account/uuid']) {
    next();
  } else {
    next({ name: 'minecraft-login' });
  }
}

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'welcome-page',
      component: Welcome,
      meta: {
        firstLaunchOnly: true,
      },
    },
    {
      path: '/login',
      name: 'minecraft-login',
      component: Login,
      beforeEnter: notMcAuthorized,
    },
    {
      path: '/whitelist',
      name: 'whitelisting',
      component: Whitelist,
      beforeEnter: mcAuthorized,
    },
    {
      path: '/overview',
      name: 'overview',
      component: Landing,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
  beforeEach: (to, from, next) => {
    if (to.matched.some(record => record.meta.firstLaunchOnly)) {
      if (store.getters['Route/firstLaunch']) {
        next();
      } else {
        next({ path: '/login' });
      }
    } else {
      next();
    }
  },
});

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
  if (store.getters['Account/uuid'] && !store.getters['Account/discordToken']) {
    next();
  } else if (store.getters['Account/discordToken'] && !store.getters['Account/uuid']) {
    next({ name: 'minecraft-login' });
  } else {
    next({ name: 'overview' });
  }
}

function fullyAuthorized(to, from, next) {
  if (store.getters['Account/uuid'] && store.getters['Account/discordToken']) {
    next();
  } else if (!store.getters['Account/uuid']) {
    next({ name: 'minecraft-login' });
  } else if (!store.getters['Account/discordToken']) {
    next({ name: 'whitelisting' });
  }
}

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
      beforeEnter: fullyAuthorized,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

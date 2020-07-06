const storage = window.localStorage;

const state = {
  firstLaunch: !storage.getItem('first-launch'),
};

const mutations = {
};

const getters = {
  firstLaunch: state => state.firstLaunch,
};

const actions = {

};

export default {
  state,
  mutations,
  getters,
  actions,
  namespaced: true,
};

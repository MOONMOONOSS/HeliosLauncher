const storage = window.localStorage;

const firstLaunch = storage.getItem('has-launched');

const state = {
  firstLaunch,
};

const mutations = {
};

const getters = {
  hasLaunched: (state) => state.firstLaunch,
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

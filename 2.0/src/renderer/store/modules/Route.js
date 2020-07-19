const storage = window.localStorage;

const firstLaunch = storage.getItem('first-launch');

const state = {
  firstLaunch: (firstLaunch === 'true' || !firstLaunch),
};

const mutations = {
};

const getters = {
  firstLaunch: (state) => state.firstLaunch,
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

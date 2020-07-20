import { ipcRenderer } from 'electron'; // eslint-disable-line

const state = {
  distribution: null,
};

const mutations = {
  distribution(state, val) {
    state.distribution = val;
  },
};

const getters = {
};

const actions = {
  pullDistro({ commit }) {
    ipcRenderer.invoke('distro-pull')
      .then((data) => commit('distribution', data));
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
  namespaced: true,
};

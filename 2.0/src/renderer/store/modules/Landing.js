import { ipcRenderer } from 'electron'; // eslint-disable-line

const state = {
  settingsVisibility: false,
};

const mutations = {
  settingsVisibility(state, val) {
    state.settingsVisibility = val;
  },
};

const getters = {
  isSettingsOpen: state => state.settingsVisibility,
  crafatar: (_state, _getters, _rootState, rootGetters) => `https://crafatar.com/renders/body/${rootGetters['Account/uuid']}?size=70&default=MHF_Steve`,
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

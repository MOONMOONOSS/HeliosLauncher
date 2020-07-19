import { ipcRenderer } from 'electron'; // eslint-disable-line

const state = {
  settingsVisibility: false,
  skinVisibility: false,
};

const mutations = {
  settingsVisibility(state, val) {
    state.settingsVisibility = val;
  },
  skinVisibility(state, val) {
    state.skinVisibility = val;
  },
};

const getters = {
  isSettingsOpen: (state) => state.settingsVisibility,
  isSkinEditOpen: (state) => state.skinVisibility,
  crafatar: (_state, _getters, _rootState, rootGetters) => `https://crafatar.com/renders/body/${rootGetters['Account/uuid']}?size=70&default=MHF_Steve`,
  serverStatus: () => async (payload) => {
    const data = await ipcRenderer.invoke('minecraft-server', JSON.stringify(payload));

    return JSON.parse(data);
  },
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

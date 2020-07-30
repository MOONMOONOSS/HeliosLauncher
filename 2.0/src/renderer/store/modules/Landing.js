import { ipcRenderer } from 'electron'; // eslint-disable-line

const storage = window.localStorage;

const state = {
  settingsVisibility: false,
  skinVisibility: false,
  serverVisibility: false,
  javaExe: storage.getItem('java-executable'),
};

const mutations = {
  settingsVisibility(state, val) {
    state.settingsVisibility = val;
  },
  skinVisibility(state, val) {
    state.skinVisibility = val;
  },
  serverVisibility(state, val) {
    state.serverVisibility = val;
  },
  setJavaExe(state, val) {
    state.javaExe = val;

    if (!val) {
      storage.removeItem('java-executable');
      return;
    }

    storage.setItem('java-executable', val);
  },
};

const getters = {
  isSettingsOpen: (state) => state.settingsVisibility,
  isSkinEditOpen: (state) => state.skinVisibility,
  isServerSelectOpen: (state) => state.serverVisibility,
  crafatar: (_state, _getters, _rootState, rootGetters) => `https://crafatar.com/renders/body/${rootGetters['Account/uuid']}?size=70&default=MHF_Steve`,
  serverStatus: () => async (payload) => {
    const data = await ipcRenderer.invoke('minecraft-server', JSON.stringify(payload));

    return JSON.parse(data);
  },
  selectedJavaExe: (state) => state.javaExe,
  javaDetails: (_state, getters, _rootState, rootGetters) => async () => {
    const details = await ipcRenderer.invoke('java-details', {
      exe: getters.selectedJavaExe,
      mcVersion: rootGetters['Distribution/selectedServer'].minecraftVersion,
    });

    console.dir(details);

    return details;
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

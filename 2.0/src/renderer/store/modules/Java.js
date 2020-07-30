import { ipcRenderer } from 'electron'; // eslint-disable-line

const storage = window.localStorage;

const state = {
  javaExe: storage.getItem('java-executable'),
};

const mutations = {
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
  selectedJavaExe: (state) => state.javaExe,
  javaDetails: (_state, getters, _rootState, rootGetters) => async () => {
    const details = await ipcRenderer.invoke('java-details', {
      exe: getters.selectedJavaExe,
      mcVersion: rootGetters['Distribution/selectedServer'].minecraftVersion,
    });

    console.dir(details);

    return details;
  },
  totalMemory: () => async () => {
    const memory = await ipcRenderer.invoke('total-memory');

    return memory;
  },
  availableMemory: () => async () => {
    const memory = await ipcRenderer.invoke('avail-memory');

    return memory;
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

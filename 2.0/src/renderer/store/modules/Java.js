import { ipcRenderer } from 'electron'; // eslint-disable-line

import StateHelper from '../stateHelpers';

const storage = window.localStorage;

const state = {
  javaExe: storage.getItem('java-executable'),
  jvmOptions: StateHelper.getJsonObj('jvm-opts') || [
    '-XX:+UseConcMarkSweepGC',
    '-XX:+CMSIncrementalMode',
    '-XX:-UseAdaptiveSizePolicy',
    '-Xmn128M',
  ],
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
  jvmOptions: (state) => state.jvmOptions,
  totalMemory: () => ipcRenderer.sendSync('total-memory'),
  availableMemory: () => ipcRenderer.sendSync('avail-memory'),
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

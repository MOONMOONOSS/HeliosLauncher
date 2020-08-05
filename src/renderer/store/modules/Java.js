import { ipcRenderer } from 'electron'; // eslint-disable-line

import StateHelper from '../stateHelpers';

const storage = window.localStorage;

const state = {
  javaExe: storage.getItem('java-executable'),
  jvmOptions: StateHelper.getJsonObj('jvm-opts') ?? [
    '-XX:+UseConcMarkSweepGC',
    '-XX:+CMSIncrementalMode',
    '-XX:-UseAdaptiveSizePolicy',
    '-Xmn128M',
  ],
  minRam: Number(storage.getItem('java-min-ram') ?? 3),
  maxRam: Number(storage.getItem('java-max-ram') ?? 3),
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
  setMinRam(state, val) {
    state.minRam = Number(Number(val).toFixed(1));
    storage.setItem('java-min-ram', String(state.minRam));
  },
  setMaxRam(state, val) {
    state.maxRam = Number(Number(val).toFixed(1));
    storage.setItem('java-max-ram', String(state.maxRam));
  },
  setJvmOpts(state, val) {
    if (val) {
      state.jvmOptions = val;

      StateHelper.setJsonObj('jvm-opts', val);
    }
  },
};

const getters = {
  selectedJavaExe: (state) => state.javaExe,
  javaConfig: (state) => state,
  javaDetails: (_state, getters, _rootState, rootGetters) => async () => {
    const details = await ipcRenderer.invoke('java-details', {
      exe: getters.selectedJavaExe,
      mcVersion: rootGetters['Distribution/selectedServer']?.minecraftVersion ?? '1.16.1',
    });

    return details;
  },
  jvmOptions: (state) => state.jvmOptions,
  totalMemory: () => Number(ipcRenderer.sendSync('total-memory')),
  availableMemory: () => Number(ipcRenderer.sendSync('avail-memory')),
  minRam: (state) => state.minRam,
  maxRam: (state) => state.maxRam,
};

const actions = {
  setMinRam({ commit }, val) {
    if (!val) {
      commit('setMinRam', 3);
      return;
    }

    commit('setMinRam', val);
  },
  setMaxRam({ commit }, val) {
    if (!val) {
      commit('setMaxRam', 3);
      return;
    }

    commit('setMaxRam', val);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
  namespaced: true,
};
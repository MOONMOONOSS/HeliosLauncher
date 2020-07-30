import { ipcRenderer } from 'electron'; // eslint-disable-line
import Vue from 'vue';

import StateHelpers from '../stateHelpers';

const storage = window.localStorage;

const state = {
  distribution: null,
  selectedServer: storage.getItem('selected-server'),
  optionalMods: StateHelpers.getJsonObj('optional-mod-prefs') || [],
  error: null,
};

const mutations = {
  distribution(state, val) {
    state.distribution = val;
  },
  selectedServer(state, val) {
    state.selectedServer = val;

    if (!val) {
      storage.removeItem('selected-server');
      return;
    }

    storage.setItem('selected-server', val);
  },
  UNSAFE_addNewOptional(state, val) {
    state.optionalMods.push(val);

    // Save our new properties to LocalStorage
    const data = JSON.stringify(state.optionalMods);
    const b64 = window.btoa(data);

    storage.setItem('optional-mod-prefs', b64);
  },
  setOptional(state, payload) {
    const { servId, modObj } = payload;
    const modId = modObj.id;

    const serverIdx = state.optionalMods
      .findIndex((server) => server.id === servId);

    const modIdx = state.optionalMods[serverIdx].modules
      .findIndex((module) => module.id === modId);

    state.optionalMods[serverIdx].modules[modIdx] = modObj;

    const newObj = state.optionalMods;

    // Set server array (for reactivity)
    Vue.set(state, 'optionalMods', newObj);
  },
  saveOptionals(state) {
    StateHelpers.setJsonObj('optional-mod-prefs', state.optionalMods);
  },
  setError(state, val) {
    state.error = val;
  },
};

const getters = {
  distribution: (state) => state.distribution,
  servers: (state) => {
    if (state.distribution) {
      return state.distribution.servers ? state.distribution.servers : [];
    }

    return [];
  },
  selectedServer: (state) => {
    if (!state.selectedServer && state.distribution) {
      if (state.distribution.servers) {
        return state.distribution.servers.find((server) => server.mainServer);
      }
    } else if (state.distribution) {
      if (state.distribution.servers) {
        return state.distribution.servers.find((server) => server.id === state.selectedServer);
      }
    }

    return null;
  },
  selectedModules: (_state, getters) => {
    if (getters.selectedServer) {
      return getters.selectedServer.modules;
    }

    return [];
  },
  selectedRequiredModules: (_state, getters) => getters.selectedModules
    .filter((module) => module.required.required === true),
  selectedOptionalModules: (_state, getters) => getters.selectedModules
    .filter((module) => module.required.required === false),
  selectedServerName: (_state, getters) => {
    if (getters.selectedServer) {
      return getters.selectedServer.name;
    }

    return '';
  },
  selectedServerId: (_state, getters) => {
    if (getters.selectedServer) {
      return getters.selectedServer.id;
    }

    return '';
  },
  selectedServerAddress: (_state, getters) => {
    if (getters.selectedServer) {
      const s = getters.selectedServer.address.split(':');
      return s[0];
    }

    return '';
  },
  selectedServerPort: (_state, getters) => {
    if (getters.selectedServer) {
      const s = getters.selectedServer.address.split(':');
      return Number(s[1]);
    }

    return '';
  },
  selectedOptionalPrefs: (state, getters) => {
    const id = getters.selectedServerId;

    if (state.optionalMods.length !== 0) {
      return state.optionalMods.find((module) => module.id === id);
    }

    return [];
  },
  optionalStatus: (_state, getters) => (id) => getters.selectedOptionalPrefs.modules
    .find((module) => module.id === id),
};

const actions = {
  pullDistro({ commit }) {
    ipcRenderer.invoke('distro-pull')
      .then((data) => commit('distribution', data))
      .catch((err) => {
        if (err && err.code) {
          switch (err.code) {
            case 'ENOTFOUND':
              commit('setError', 'OFFLINE');
              break;
            default:
              throw new Error(err.message);
          }
        }

        if (err && err.type) {
          switch (err.type) {
            case 'request-timeout':
              commit('setError', 'TIMEDOUT');
              break;
            default:
              throw new Error(err.message);
          }
        }
      });
  },
  setOptionalDefaults({ commit, getters, state }) {
    return new Promise((resolve) => {
      getters.servers.forEach((server) => {
        // Check if we have a listing in the optional preferences
        // and the version matches the one present in our distro.
        const condition = state.optionalMods
          .filter((module) => module.id === server.id
            && module.version === server.version);

        // Insert defaults if condition is not met
        if (!condition || (condition && condition.length === 0)) {
          // Get all optional mods for this configuration
          const modules = server.modules
            .filter((module) => module.required.required === false);
          const arr = [];

          // Create our array of module defaults
          modules.forEach((module) => {
            arr.push({
              id: module.id,
              enabled: module.required.default || false,
            });
          });

          // Create and append our server data to the state
          // THIS ASSUMES THAT WE DO NOT CURRENTLY HAVE AN
          // OBJECT IN THE PREFERENCES ARRAY WITH THE SAME ID
          commit('UNSAFE_addNewOptional', {
            id: server.id,
            version: server.version,
            modules: arr,
          });

          resolve();
        }
      });
    });
  },
  setOptional({ commit, getters }, payload) {
    return new Promise((resolve) => {
      const servId = getters.selectedServerId;

      commit('setOptional', {
        servId,
        modObj: payload,
      });

      commit('saveOptionals');

      resolve();
    });
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
  namespaced: true,
};

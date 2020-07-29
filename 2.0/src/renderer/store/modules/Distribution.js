import { ipcRenderer } from 'electron'; // eslint-disable-line
import Vue from 'vue';

const storage = window.localStorage;

/**
 * Attempts to retrieve and decode a Base64
 * encoded JSON object in LocalStorage.
 *
 * @param {string} key The key to look up in LocalStorage
 * @private
 * @returns {?Array<Object>} The JSON Object, if found
 */
function getJsonObj(key) {
  if (!key) {
    // eslint-disable-next-line no-console
    console.warn('Attempted to look up a key with an undefined value');
    return null;
  }

  const data = storage.getItem(key);
  if (data) {
    const buff = Buffer.from(data).toString();
    const b64 = window.atob(buff);

    return JSON.parse(b64);
  }

  return null;
}

const state = {
  distribution: null,
  selectedServer: storage.getItem('selected-server'),
  optionalMods: getJsonObj('optional-mod-prefs') || [],
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
    // Save our new properties to LocalStorage
    const data = JSON.stringify(state.optionalMods);
    const b64 = window.btoa(data);

    storage.setItem('optional-mod-prefs', b64);
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
  selectedModules: (state, getters) => {
    if (getters.selectedServer) {
      return getters.selectedServer.modules;
    }

    return [];
  },
  selectedRequiredModules: (state, getters) => getters.selectedModules
    .filter((module) => module.required.required === true),
  selectedOptionalModules: (state, getters) => getters.selectedModules
    .filter((module) => module.required.required === false),
  selectedServerName: (state, getters) => {
    if (getters.selectedServer) {
      return getters.selectedServer.name;
    }

    return '';
  },
  selectedServerId: (state, getters) => {
    if (getters.selectedServer) {
      return getters.selectedServer.id;
    }

    return '';
  },
  selectedServerAddress: (state, getters) => {
    if (getters.selectedServer) {
      const s = getters.selectedServer.address.split(':');
      return s[0];
    }

    return '';
  },
  selectedServerPort: (state, getters) => {
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
      .then((data) => commit('distribution', data));
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

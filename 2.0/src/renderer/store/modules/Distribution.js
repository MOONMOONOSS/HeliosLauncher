import { ipcRenderer } from 'electron'; // eslint-disable-line

const storage = window.localStorage;

const state = {
  distribution: null,
  selectedServer: storage.getItem('selected-server'),
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

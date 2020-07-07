const storage = window.localStorage;

const state = {
  accessToken: storage.getItem('mc-access-token'),
  clientToken: storage.getItem('mc-client-token'),
  displayName: storage.getItem('mc-name'),
  username: storage.getItem('mc-username'),
  uuid: storage.getItem('mc-uuid'),
};

const mutations = {
  accessToken(state, val) {
    state.accessToken = val;
    storage.setItem('mc-access-token', String(val));
  },
  clientToken(state, val) {
    state.clientToken = val;
    storage.setItem('mc-client-token', String(val));
  },
  displayName(state, val) {
    state.displayName = val;
    storage.setItem('mc-name', String(val));
  },
  username(state, val) {
    state.username = val;
    storage.setItem('mc-username', String(val));
  },
  uuid(state, val) {
    state.uuid = val;
    storage.setItem('mc-uuid', String(val));
  },
};

const getters = {
  clientToken: state => state.clientToken,
};

const actions = {
  addAccount({ commit }, apiData, username) {
    return new Promise((resolve, reject) => {
      try {
        const { id, name } = apiData.selectedProfile;
        const { accessToken } = apiData;

        commit('accessToken', accessToken);
        commit('displayName', name);
        commit('username', username);
        commit('uuid', id);
        debugger;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Problem committing account state', err);
        reject(err);
      }

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

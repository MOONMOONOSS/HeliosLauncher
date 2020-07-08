const storage = window.localStorage;

const state = {
  accessToken: storage.getItem('mc-access-token'),
  clientToken: storage.getItem('mc-client-token'),
  displayName: storage.getItem('mc-name'),
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
  uuid(state, val) {
    state.uuid = val;
    storage.setItem('mc-uuid', String(val));
  },
};

const getters = {
  clientToken: state => state.clientToken,
  username: state => state.displayName,
  uuid: state => state.uuid,
};

const actions = {
  addAccount({ commit }, apiData) {
    return new Promise((resolve, reject) => {
      try {
        const { id, name } = apiData.session.selectedProfile;
        const { accessToken } = apiData.session;

        commit('accessToken', accessToken);
        commit('displayName', name);
        commit('uuid', id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Problem committing account state', err);
        reject(err);
      }

      resolve();
    });
  },
  clientToken({ commit }, token) {
    return new Promise((resolve) => {
      commit('clientToken', token);

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

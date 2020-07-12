import { ipcRenderer } from 'electron'; // eslint-disable-line

const storage = window.localStorage;

const state = {
  accessToken: storage.getItem('mc-access-token'),
  clientToken: storage.getItem('mc-client-token'),
  displayName: storage.getItem('mc-name'),
  uuid: storage.getItem('mc-uuid'),
  discordCode: null,
  discordToken: storage.getItem('discord-token'),
  discordRefresh: storage.getItem('discord-refresh'),
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
  discordCode(state, val) {
    state.discordCode = val;
  },
  discordToken(state, val) {
    state.discordToken = val;
    storage.setItem('discord-token', String(val));
  },
  discordRefresh(state, val) {
    state.discordRefresh = val;
    storage.setItem('discord-refresh', String(val));
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
  discordToken: state => state.discordToken,
  discordRefresh: state => state.discordRefresh,
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
  discordCode({ commit }, code) {
    return new Promise((resolve, reject) => {
      commit('discordCode', code);

      ipcRenderer.invoke('discord-exchange', code)
        .then((result) => {
          result = JSON.parse(result);
          commit('discordRefresh', result.refresh_token);
          commit('discordToken', result.access_token);
          commit('discordCode', null);

          resolve();
        })
        .catch(() => reject(Error('Failed to exchange Discord token')));
    });
  },
  discordRefresh({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.discordToken && state.discordRefresh) {
        ipcRenderer.invoke('discord-refresh', state.discordRefresh)
          .then((result) => {
            result = JSON.parse(result);

            commit('discordToken', result.access_token);
            commit('discordRefresh', result.refresh_token);

            resolve();
          })
          .catch((err) => {
            commit('discordToken', null);
            commit('discordRefresh', null);

            storage.removeItem('discord-token');
            storage.removeItem('discord-refresh');

            // eslint-disable-next-line no-console
            console.error('Unable to refresh Discord token!', err);
            reject(err);
          });
      } else {
        reject(Error('Not signed into Discord'));
      }
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

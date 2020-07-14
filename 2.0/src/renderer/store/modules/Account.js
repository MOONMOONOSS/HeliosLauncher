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

    if (!val) {
      storage.removeItem('mc-access-token');
      return;
    }

    storage.setItem('mc-access-token', String(val));
  },
  clientToken(state, val) {
    state.clientToken = val;

    if (!val) {
      storage.removeItem('mc-client-token');
      return;
    }

    storage.setItem('mc-client-token', String(val));
  },
  discordCode(state, val) {
    state.discordCode = val;
  },
  discordToken(state, val) {
    state.discordToken = val;

    if (!val) {
      storage.removeItem('discord-token');
      return;
    }

    storage.setItem('discord-token', String(val));
  },
  discordRefresh(state, val) {
    state.discordRefresh = val;

    if (!val) {
      storage.removeItem('discord-refresh');
      return;
    }

    storage.setItem('discord-refresh', String(val));
  },
  displayName(state, val) {
    state.displayName = val;

    if (!val) {
      storage.removeItem('mc-name');
      return;
    }

    storage.setItem('mc-name', String(val));
  },
  uuid(state, val) {
    state.uuid = val;

    if (!val) {
      storage.removeItem('mc-uuid');
      return;
    }

    storage.setItem('mc-uuid', String(val));
  },
};

const getters = {
  accessToken: state => state.accessToken,
  clientToken: state => state.clientToken,
  discordToken: state => state.discordToken,
  discordRefresh: state => state.discordRefresh,
  username: state => state.displayName,
  uuid: state => state.uuid,
  whitelistStatus(state) {
    return new Promise((resolve, reject) => {
      if (state.discordToken && state.discordRefresh) {
        ipcRenderer.invoke('whitelist-status', state.discordToken)
          .then(result => JSON.parse(result))
          .then(data => resolve(data))
          .catch(err => reject(err));
      } else {
        resolve(null);
      }
    });
  },
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
  discordReset({ commit }) {
    return new Promise((resolve) => {
      commit('discordToken');
      commit('discordRefresh');

      resolve();
    });
  },
  minecraftReset({ commit }) {
    return new Promise((resolve) => {
      commit('accessToken');
      commit('clientToken');
      commit('displayName');
      commit('uuid');

      resolve();
    });
  },
  registerMcAccount({ state }) {
    return new Promise((resolve, reject) => {
      if (state.discordToken && state.discordRefresh && state.uuid) {
        const payload = JSON.stringify({
          token: state.discordToken,
          uuid: state.uuid,
        });

        ipcRenderer.invoke('whitelist-register', payload)
          .then(() => resolve())
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('Unable to link Minecraft account', err);
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
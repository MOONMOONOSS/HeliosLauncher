// @flow

import { ipcRenderer } from 'electron'; // eslint-disable-line

const storage: Storage = window.localStorage;

type VueState = {|
  accessToken: ?string,
  clientToken: ?string,
  displayName: ?string,
  uuid: ?string,
  discordCode: ?string,
  discordToken: ?string,
  discordRefresh: ?string,
  skinChangeTime: ?string,
|};

type MojangProfile = {|
  id: string,
  name: string,
|};

type MojangUser = {|
  id: string,
  username: string,
|};

type MojangLogin = {
  accessToken?: string,
  availableProfiles?: Array<MojangProfile>,
  clientToken?: string,
  error?: string,
  errorMessage?: string,
  selectedProfile?: MojangProfile,
  user?: MojangUser,
}

const state: VueState = {
  accessToken: storage.getItem('mc-access-token'),
  clientToken: storage.getItem('mc-client-token'),
  displayName: storage.getItem('mc-name'),
  uuid: storage.getItem('mc-uuid'),
  discordCode: null,
  discordToken: storage.getItem('discord-token'),
  discordRefresh: storage.getItem('discord-refresh'),
  skinChangeTime: storage.getItem('skin-change-time'),
};

const mutations = {
  accessToken(state: VueState, val: ?string) {
    state.accessToken = val;

    if (!val) {
      storage.removeItem('mc-access-token');
      return;
    }

    storage.setItem('mc-access-token', val);
  },
  clientToken(state: VueState, val: ?string) {
    state.clientToken = val;

    if (!val) {
      storage.removeItem('mc-client-token');
      return;
    }

    storage.setItem('mc-client-token', String(val));
  },
  discordCode(state: VueState, val: ?string) {
    state.discordCode = val;
  },
  discordToken(state: VueState, val: ?string) {
    state.discordToken = val;

    if (!val) {
      storage.removeItem('discord-token');
      return;
    }

    storage.setItem('discord-token', String(val));
  },
  discordRefresh(state: VueState, val: ?string) {
    state.discordRefresh = val;

    if (!val) {
      storage.removeItem('discord-refresh');
      return;
    }

    storage.setItem('discord-refresh', String(val));
  },
  displayName(state: VueState, val: ?string) {
    state.displayName = val;

    if (!val) {
      storage.removeItem('mc-name');
      return;
    }

    storage.setItem('mc-name', String(val));
  },
  uuid(state: VueState, val: ?string) {
    state.uuid = val;

    if (!val) {
      storage.removeItem('mc-uuid');
      return;
    }

    storage.setItem('mc-uuid', String(val));
  },
  skinChangeTime(state: VueState, val: ?string) {
    state.skinChangeTime = val;

    if (!val) {
      storage.removeItem('skin-change-time');
      return;
    }

    storage.setItem('skin-change-time', String(val));
  },
};

const getters = {
  accessToken: (state: VueState) => state.accessToken,
  clientToken: (state: VueState) => state.clientToken,
  discordToken: (state: VueState) => state.discordToken,
  discordRefresh: (state: VueState) => state.discordRefresh,
  skinChangeTime: (state: VueState) => state.skinChangeTime,
  username: (state: VueState) => state.displayName,
  uuid: (state: VueState) => state.uuid,
  whitelistStatus(state: VueState): Promise<?boolean> {
    return new Promise((resolve, reject) => {
      if (state.discordToken && state.discordRefresh) {
        ipcRenderer.invoke('whitelist-status', state.discordToken)
          .then((result) => JSON.parse(result))
          .then((data) => resolve(data))
          .catch((err) => reject(err));
      } else {
        resolve(null);
      }
    });
  },
};

const actions = {
  addAccount({ commit }: {commit: Function}, apiData: MojangLogin): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const { accessToken, selectedProfile }:
          { accessToken: any, selectedProfile: any } = apiData; // fuck off Flow

        commit('accessToken', accessToken);
        commit('displayName', selectedProfile.name);
        commit('uuid', selectedProfile.id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Problem committing account state', err);
        reject(err);
      }

      resolve();
    });
  },
  clientToken({ commit }: {commit: Function}, token: string): Promise<void> {
    return new Promise((resolve) => {
      commit('clientToken', token);

      resolve();
    });
  },
  discordCode({ commit }: {commit: Function}, code: string): Promise<void> {
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
  discordRefresh({ commit, state }: {commit: Function, state: VueState}): Promise<void> {
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
  discordReset({ commit }: {commit: Function}): Promise<void> {
    return new Promise((resolve) => {
      commit('discordToken');
      commit('discordRefresh');

      resolve();
    });
  },
  minecraftReset({ commit }: {commit: Function}): Promise<void> {
    return new Promise((resolve) => {
      commit('accessToken');
      commit('clientToken');
      commit('displayName');
      commit('uuid');

      resolve();
    });
  },
  registerMcAccount({ state }: {state: VueState}): Promise<void> {
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

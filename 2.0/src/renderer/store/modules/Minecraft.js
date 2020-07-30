import StateHelpers from '../stateHelpers';

const storage = window.localStorage;

const state = {
  resolution: StateHelpers.getJsonObj('mc-resolution') || [1280, 720],
  fullScreen: Boolean(storage.getItem('mc-fullscreen')),
  autoConnect: Boolean(storage.getItem('mc-autoconnect')),
};

const mutations = {
  setResolution(state, val) {
    state.resolution = val;

    StateHelpers.setJsonObj('mc-resolution', val);
  },
  setFullScreen(state, val) {
    state.fullScreen = val;

    storage.setItem('mc-fullscreen', String(val));
  },
  setAutoConnect(state, val) {
    state.autoConnect = val;

    storage.setItem('mc-autoconnect', String(val));
  },
};

const getters = {
  gameResolution: (state) => ({
    width: state.resolution[0],
    height: state.resolution[1],
  }),
  isFullScreen: (state) => state.fullScreen,
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

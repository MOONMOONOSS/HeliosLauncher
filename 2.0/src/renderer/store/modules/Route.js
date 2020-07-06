const storage = window.localStorage;

const state = {
  firstLaunch: !storage.getItem('first-launch'),
};

const mutations = {
};

const getters = {
  firstLaunch: state => state.firstLaunch,
};

const actions = {

};

// Set first launch property if not present
// Suppresses the welcome screen
try {
  storage.setItem('first-launch', 'false');
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Unable to access site storage!');
}

export default {
  state,
  mutations,
  getters,
  actions,
};

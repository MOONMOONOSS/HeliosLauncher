import store from '../store/index';

export default class {
  static async addAccount(session) {
    try {
      if (session.selectedProfile != null) {
        await store.dispatch('Account/addAccount', { session });

        if (store.getters['Account/clientToken'] == null) {
          await store.dispatch('Account/clientToken', session.clientToken);
        }
      } else {
        throw new Error('TrialAccount');
      }
    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve();
  }
}

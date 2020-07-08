import store from '../store/index';
import Mojang from './mojang';

export default class {
  static async addAccount(username, password) {
    try {
      const session = await Mojang.authenticate(username, password, store.getters['Account/clientToken']);
      if (session.selectedProfile != null) {
        await store.dispatch('Account/addAccount', { session, username });

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

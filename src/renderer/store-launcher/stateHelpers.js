const storage = window.localStorage;

export default class StateHelpers {
  /**
  * Attempts to retrieve and decode a Base64
  * encoded JSON object in LocalStorage.
  *
  * @param {string} key The key to look up in LocalStorage
  * @private
  * @returns {?Array<Object>} The JSON Object, if found
  */
  static getJsonObj(key) {
    if (!key) {
      // eslint-disable-next-line no-console
      console.warn('Attempted to look up a key with an undefined value');
      return null;
    }

    const data = storage.getItem(key);
    if (data) {
      const buff = Buffer.from(data).toString();
      const b64 = window.atob(buff);

      return JSON.parse(b64);
    }

    return null;
  }

  /**
   * Serializes an Object to a JSON string, then encodes as a
   * Base64 string saving to LocalStorage.
   *
   * @static
   * @param {string} key The key to update
   * @param {Object?} val The object to serialize into base64
   * @memberof StateHelpers
   */
  static setJsonObj(key, val) {
    if (!key) {
      throw new Error('key is undefined');
    }

    if (val) {
      const data = JSON.stringify(val);
      const b64 = window.btoa(data);

      storage.setItem(key, b64);
    } else {
      storage.removeItem(key);
    }
  }
}

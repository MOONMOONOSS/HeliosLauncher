import fetchNode from 'node-fetch';

export default class {
  /**
   * Useragent data sent to Mojang
   */
  static minecraftAgent = {
    name: 'Minecraft',
    version: 1,
  };

  /**
   * The server used to authenticate Minecraft credentials with
   */
  static authServer = 'https://authserver.mojang.com';

  /**
   * Authenticate a user with their Mojang credentials.
   *
   * @param {string} username The user's username, this is often an email.
   * @param {string} password The user's password.
   * @param {string} clientToken The launcher's Client Token.
   * @param {boolean} requestUser Optional. Adds user object to the reponse.
   * @param {Object} agent Optional. Provided by default. Adds user info to the response.
   *
   * @see http://wiki.vg/Authentication#Authenticate
   *
   * @returns {Promise<Object>}
   */
  static authenticate(
    username,
    password,
    clientToken,
    requestUser = true,
    agent = this.minecraftAgent,
  ) {
    return new Promise(async (resolve, reject) => {
      /**
       * HTTP request body
       */
      const body = {
        agent,
        username,
        password,
        requestUser,
      };

      if (clientToken != null) {
        body.clientToken = clientToken;
      }

      /**
       * Options for Fetch API call
       */
      const params = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(body),
      };

      try {
        let res = await fetchNode(`${this.authServer}/authenticate`, params);
        res = await res.json();

        if (res.error) {
          reject(res);
        } else {
          resolve(res);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('shits broke fam', err);
        reject(err);
      }
    });
  }

  /**
   * Invalidates an access token. The clientToken must match the
   * token used to create the provided accessToken.
   *
   * @param {string} accessToken The access token to invalidate.
   * @param {string} clientToken The launcher's client token.
   *
   * @see http://wiki.vg/Authentication#Invalidate
   * @returns {Promise<object>}
   */
  static invalidate(accessToken, clientToken) {
    return new Promise(async (resolve, reject) => {
      // Return immediately if missing data
      if (!accessToken || !clientToken) {
        return reject(Error('Missing required values'));
      }

      /**
       * HTTP request body
       */
      const body = {
        accessToken,
        clientToken,
      };

      /**
       * Options for Fetch API call
       */
      const params = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(body),
      };

      try {
        let res = await fetchNode(`${this.authServer}/refresh`, params);

        if (res.status !== 200) {
          return reject(res);
        }

        res = await res.json();

        return resolve(res);
      } catch (err) {
        return reject(err);
      }
    });
  }
}

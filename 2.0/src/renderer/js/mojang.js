import fetchNode from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

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
   * The server used to perform Minecraft related requests with
   * @static
   */
  static apiServer = 'https://api.mojang.com/';

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

  /**
   * Uploads a raw image buffer to Mojang as an account skin.
   *
   * @static
   * @param {string} clientToken The client access token used to authorize this request
   * @param {string} uuid The account's UUID
   * @param {string} skinType The chosen skin type
   * @param {string} filePath Path to file to be uploaded
   */
  static uploadSkin(clientToken, uuid, skinType, filePath) {
    return new Promise(async (resolve, reject) => {
      // Return immediately if missing data
      if (!clientToken) {
        return reject(Error('Missing required values'));
      }

      const formData = new FormData();
      formData.append('model', skinType);
      formData.append('file', fs.createReadStream(filePath));

      /**
       * Options for Fetch API call
       */
      const params = {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${clientToken}`,
        },
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        body: formData,
      };

      try {
        const res = await fetchNode(`${this.apiServer}/user/profile/${uuid}/skin`, params);

        if (res.status !== 200) {
          return reject(res);
        }

        return resolve(res);
      } catch (err) {
        return reject(err);
      }
    });
  }
}

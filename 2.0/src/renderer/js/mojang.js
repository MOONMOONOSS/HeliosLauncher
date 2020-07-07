import request from 'request';

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
    return new Promise((resolve, reject) => {
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

      console.log('test');

      request.post(
        `${this.authServer}/authenticate`,
        {
          json: true,
          body,
        },
        (err, res, httpBody) => {
          console.dir(httpBody);
          if (err) {
            // eslint-disable-next-line no-console
            console.error('Error during authentication', err);
            reject(err);
          }
          if (res.statusCode === 200) {
            resolve(httpBody);
          } else {
            reject(httpBody || { code: 'ENOTFOUND' });
          }
        },
      );
    });
  }
}

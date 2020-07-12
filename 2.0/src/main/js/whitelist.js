import { BrowserWindow } from 'electron';
import Url from 'url';
import fetchNode from 'node-fetch';
import https from 'https';

export default class Whitelist {
  /**
   * Discord Application ID
   * @static
   */
  static clientId = '604009411928784917';
  /**
   * Redirect URI for Discord Application
   * @static
   */
  static redirectUri = 'https://localhost:8080/discord';
  /**
   * Array of scopes to request from Discord
   * @static
   */
  static scopes = ['identify', 'guilds'];
  /**
   * Base MOON2 API URI
   * @static
   */
  static baseUri = 'https://panel.moonmoon.live:8000/v1';
  /**
   * The computed Discord OAuth2 URI
   * @static
   */
  static oauthUri = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(Whitelist.clientId)}&redirect_uri=${encodeURIComponent(Whitelist.redirectUri)}&response_type=code&scope=${encodeURIComponent(Whitelist.scopes.join(' '))}`;

  /**
   * requestCode
   *
   * Manages the window for Discord OAuth flow login and parses access code from the url
   *
   * @static
   * @param {Electron.IpcMainEvent} ev Event sent from Electron to our function
   * @memberof Whitelist
   * @returns {Promise<string>} access_code from the url
   */
  static requestCode(ev) {
    // eslint-disable-next-line no-console
    console.log('Requesting auth code from Discord...');

    /**
     * The configuration for the OAuth 2 Electron window
     * Just large enough to get the Discord QR Code thingy!
     * @static
     */
    const windowConfig = {
      backgroundColor: '#222222',
      height: 800,
      modal: true,
      parent: BrowserWindow.fromWebContents(ev.sender),
      title: 'Discord OAuth2 Request',
      webPreferences: {
        devTools: false,
      },
      width: 850,
    };

    return new Promise((resolve, reject) => {
      const authWindow = new BrowserWindow(windowConfig);
      authWindow.loadURL(this.oauthUri);

      authWindow.once('ready-to-show', () => {
        authWindow.show();
      });

      // eslint-disable-next-line no-console
      console.log('Awaiting Discord user approval');

      authWindow.webContents.on('will-navigate', (_ev, to) => {
        let currentUrl;
        if (!to) {
          currentUrl = null;
        } else {
          currentUrl = Url.parse(to);
        }
        if (currentUrl.hostname === 'localhost') {
          authWindow.webContents.navigatingUrl = to;
          authWindow.close();
        }
      });

      authWindow.on('close', () => {
        if (!authWindow.webContents.navigatingUrl) {
          return reject(new Error('Discord OAuth2 failed to authenticate'));
        }
        /**
         * Query parameters returned from Discord.
         * Does not indicate successful authentication
         *
         * @type {ParsedUrlQuery}
         */
        const queryObject = Url.parse(authWindow.webContents.navigatingUrl, true).query;
        if (queryObject.code) {
          return resolve({ code: queryObject.code });
        }

        return reject(new Error('Discord OAuth2 failed to authenticate'));
      });
    });
  }

  /**
   * Exchanges an access code for an access token from MOON2 Services
   *
   * @static
   * @param {string} code OAuth 2 authorization code
   * @memberof Whitelist
   * @returns {Promise<Object>} a promise to an accessToken as returned by MOON2 Services
   */
  static requestToken(code) {
    return new Promise(async (resolve, reject) => {
      /**
       * Proof of why we can't have nice things
       */
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      /**
       * Options for Fetch API call
       */
      const params = {
        method: 'POST',
        cache: 'no-cache',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'error',
        body: JSON.stringify({ token: code }),
        agent,
      };

      try {
        let res = await fetchNode(`${Whitelist.baseUri}/login`, params);

        if (res.status !== 200) {
          return reject(Error(res.statusText));
        }

        res = await res.json();

        console.dir(res);

        return resolve(res);
      } catch (err) {
        return reject(err);
      }
    });
  }
}

import { BrowserWindow } from 'electron';
import Url from 'url';

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
   * @argument {Electron.IpcMainEvent} ev Event sent from Electron to our function
   *
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
        const currentUrl = Url.parse(to);
        if (currentUrl.hostname === 'localhost') {
          authWindow.webContents.navigatingUrl = to;
          authWindow.close();
        }
      });

      authWindow.on('close', () => {
        /**
         * Query parameters returned from Discord.
         * Does not indicate successful authentication
         *
         * @type {ParsedUrlQuery}
         */
        const queryObject = Url.parse(authWindow.webContents.navigatingUrl, true).query;
        if (queryObject.code) {
          resolve({ code: queryObject.code });
        } else {
          reject(new Error('Discord OAuth2 failed to authenticate'));
        }
      });
    });
  }
}

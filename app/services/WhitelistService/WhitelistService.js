const electron = require("electron");
const url = require("url");
const request = require('request')

const whitelistServiceLogger = LoggerUtil(
  "%c[WhitelistService]",
  "color: #ffffff; font-weight: bold"
);

const BrowserWindow = electron.remote.BrowserWindow;

class WhitelistService {
  constructor(client_id = "", redirect_uri = "", scopes = []) {
    whitelistServiceLogger.debug("Constructing...");
    this.client_id = client_id;
    this.redirect_uri = redirect_uri;
    this.scopes = scopes;
    this.baseUrl = "https://pushy-melted-wasabi.glitch.me";
    this.authWindowConfig = {
      width: 850,
      height: 800,
      title: "Discord Authorization",
    };
  }

  _getAuthUrl() {
    whitelistServiceLogger.debug("Building Auth Url...");

    const encodedClientId = encodeURIComponent(this.client_id);
    const encodedRedirectUri = encodeURIComponent(this.redirect_uri);
    const encodedScopes = encodeURIComponent(this.scopes.join(" "));
    return `https://discord.com/api/oauth2/authorize?client_id=${encodedClientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${encodedScopes}`;
  }
  
  requestCode() {
    whitelistServiceLogger.debug("Requesting auth code from Discord...");
    return new Promise((resolve, reject) => {
      const authUrl = this._getAuthUrl();

      let authWindow = new BrowserWindow(this.authWindowConfig);
      authWindow.loadURL(authUrl);

      authWindow.once("ready-to-show", () => {
        authWindow.show();
      });
      whitelistServiceLogger.debug("Awaiting user login and approval...");

      authWindow.webContents.on("will-navigate", (event, newUrl) => {
        whitelistServiceLogger.debug("User interaction complete. Resolving...");

        authWindow.close();
        authWindow = null;

        const queryObject = url.parse(newUrl, true).query;
        if (queryObject.code) {
          resolve(queryObject.code);
        } else {
          reject();
        }
      });
    });
  }

  requestToken(exchangeCode) {
    whitelistServiceLogger.debug("Requesting Token...");

    let requestConfig = {
      json: {
        "exchange_key": exchangeCode
      },
    };

    return new Promise((resolve, reject) => {
      request.post(`${this.baseUrl}/login`, requestConfig, (error, response, body) => {
          if (error) {
            whitelistServiceLogger.debug("error during get token...");
            reject(error);
          } else {
            if(response.statusCode !== 200){
              whitelistServiceLogger.debug("error during get token...");
              reject(response.statusCode)
            } else{
              whitelistServiceLogger.debug("token request successful...");
              resolve(body);
            }
          }
        }
      );
    });
  }

  refreshToken(token) {
    whitelistServiceLogger.debug("Refreshing Token...");

    let requestConfig = {
      json: {
        "refresh_token": token.refresh_token
      },
    };

    return new Promise((resolve, reject) => {
      request.post(`${this.baseUrl}/login/refresh`, requestConfig, (error, response, body) => {
          if (error) {
            whitelistServiceLogger.debug("error during refresh...");
            reject(error);
          } else {
            if(response.statusCode !== 200){
              whitelistServiceLogger.debug("error during refresh...");
              reject(response.statusCode)
            } else{
              whitelistServiceLogger.debug("token refresh successful...");
              resolve(body);
            }
          }
        }
      );
    });
  }

  getWhitelistStatus(token) {
    whitelistServiceLogger.debug("Getting Status...");

    let requestConfig = {
      json: {
        "bearer_token": token.access_token
      },
    };

    return new Promise((resolve, reject) => {
      request.post(`${this.baseUrl}/status/whitelist`, requestConfig, (error, response, body) => {
          if (error) {
            whitelistServiceLogger.debug("error getting status...");
            reject(error);
          } else {
            if(response.statusCode !== 200){
              whitelistServiceLogger.debug("error getting status...");
              reject(response.statusCode)
            } else{
              whitelistServiceLogger.debug("Get status successful...");
              resolve(body);
            }
          }
        }
      );
    });
  }

  linkAccount(token, uuid) {
    whitelistServiceLogger.debug("Linking Account...");

    let requestConfig = {
      json:{
        "bearer_token": token.access_token
      },
    };

    return new Promise((resolve, reject) => {
      request.post(`${this.baseUrl}/whitelist/${uuid}`, requestConfig, (error, response, body) => {
          if (error) {
            whitelistServiceLogger.debug("error during linking...");
            reject(error);
          } else {
            if(response.statusCode !== 200){
              whitelistServiceLogger.debug("error during linking...");
              reject(response.statusCode)
            } else{
              whitelistServiceLogger.debug("link account successful...");
              resolve();
            }
          }
        }
      );
    });
  }
}

exports.WhitelistService = WhitelistService;

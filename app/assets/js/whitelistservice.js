const electron = require("electron");
const url = require("url");
const request = require("request");

const whitelistServiceLogger = LoggerUtil("%c[WhitelistService]", "color: #ffffff; font-weight: bold");

const BrowserWindow = electron.remote.BrowserWindow;

class WhitelistService {
    constructor() {
        whitelistServiceLogger.info("Constructing...");
        this.client_id = "604009411928784917";
        this.redirect_uri = "https://localhost:8080/discord";
        this.scopes = ["identify", "guilds"];
        this.baseUrl = "https://panel.moonmoon.live:8000/v1";
        this.authWindowConfig = {
            width: 850,
            height: 800,
            title: "Discord Authorization",
            backgroundColor: "#222222"
        };
    }

    /**
     * _getAuthUrl
     * 
     * Builds the Discord OAuth flow url
     * 
     * @returns {string} URL to begin discord OAuth flow
     */
    _getAuthUrl() {
        whitelistServiceLogger.info("Building Auth Url...");

        const encodedClientId = encodeURIComponent(this.client_id);
        const encodedRedirectUri = encodeURIComponent(this.redirect_uri);
        const encodedScopes = encodeURIComponent(this.scopes.join(" "));
        return `https://discord.com/api/oauth2/authorize?client_id=${encodedClientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${encodedScopes}`;
    }

    /**
     * requestCode
     * 
     * Manages the window for Discord OAuth flow login and parses access code from the url
     * 
     * @returns {string} access_code from the url
     */
    requestCode() {
        whitelistServiceLogger.info("Requesting auth code from Discord...");
        return new Promise((resolve, reject) => {
            const authUrl = this._getAuthUrl();
            let access_code = null;

            let authWindow = new BrowserWindow(this.authWindowConfig);
            authWindow.loadURL(authUrl);

            authWindow.once("ready-to-show", () => {
                authWindow.show();
            });

            whitelistServiceLogger.info("Awaiting user login and approval...");

            authWindow.webContents.on("will-navigate", (event, newUrl) => {
                whitelistServiceLogger.info("User interaction complete. Resolving...");

                const queryObject = url.parse(newUrl, true).query;
                if (queryObject.code) {
                    authWindow.close();
                    authWindow = null;
                    access_code = queryObject.code;
                } else if (queryObject.error) {
                    authWindow.close();
                    authWindow = null;
                    access_code = null;
                }
            });

            authWindow.on("closed", (e) => {
                whitelistServiceLogger.info("User closed window...");
                authWindow = null;
                if (access_code !== null) {
                    resolve(access_code);
                } else {
                    reject();
                }
            });
        });
    }

    /**
     * requestToken
     * 
     * Exchanges an access code for an access token from the application service
     * 
     * @param {string} access_code from OAuth flow to exhcange for token
     * @returns {object} access_token returned by application service
     */
    requestToken(access_code) {
        whitelistServiceLogger.info("Requesting Token...");

        let requestConfig = {
            strictSSL: false,
            headers: { "Content-Type": "application/json" },
            json: { token: access_code }
        };

        return new Promise((resolve, reject) => {
            request.post(`${this.baseUrl}/login`, requestConfig, (error, response, body) => {
                if (error) {
                    whitelistServiceLogger.info("error during get token...", error);
                    whitelistServiceLogger.info(response);

                    reject(error);
                } else {
                    if (response.statusCode !== 200) {
                        whitelistServiceLogger.info("error during get token...", response.statusCode);
                        reject(response.statusCode);
                    } else {
                        whitelistServiceLogger.info("token request successful...");
                        resolve(body);
                    }
                }
            });
        });
    }

    /**
     * requestToken
     * 
     * Exchanges a refresh token for a new access token from the application service
     * 
     * @param {object} access_token containing the refresh token
     * @returns {object} access_token returned by application service
     */
    refreshToken(access_token) {
        whitelistServiceLogger.info("Refreshing Token...");

        let requestConfig = {
            strictSSL: false,
            headers: { "Content-Type": "application/json" },
            json: { token: access_token.refresh_token }
        };

        return new Promise((resolve, reject) => {
            request.post(`${this.baseUrl}/refresh`, requestConfig, (error, response, body) => {
                if (error) {
                    whitelistServiceLogger.info("error during refresh...");
                    reject(error);
                } else {
                    if (response.statusCode !== 200) {
                        whitelistServiceLogger.info("error during refresh...");
                        reject(response.statusCode);
                    } else {
                        whitelistServiceLogger.info("token refresh successful...");
                        resolve(body);
                    }
                }
            });
        });
    }

    /**
     * getWhitelistStatus
     * 
     * Gets the current whitelist status for the current discord user
     * 
     * @param {object} access_token containing the sub access_token
     * @returns {object} status of the current discord user
     */
    getWhitelistStatus(access_token) {
        whitelistServiceLogger.info("Getting Status...");

        let requestConfig = {
            strictSSL: false,
            headers: { "Content-Type": "application/json" },
            json: { token: access_token.access_token }
        };

        return new Promise((resolve, reject) => {
            request.post(`${this.baseUrl}/whitelist/status`, requestConfig, (error, response, body) => {
                if (error) {
                    whitelistServiceLogger.info("error getting status...");
                    reject(error);
                } else {
                    if (response.statusCode !== 200) {
                        whitelistServiceLogger.info("error getting status...");
                        reject(response.statusCode);
                    } else {
                        whitelistServiceLogger.info("Get status successful...");
                        resolve(body);
                    }
                }
            });
        });
    }

    /**
     * linkAccount
     * 
     * Gets the current whitelist status for the current discord user
     * 
     * @param {object} access_token containing the sub access_token
     * @param {string} uuid the minecraft account uuid
     */
    linkAccount(access_token, uuid) {
        whitelistServiceLogger.info("Linking Account...");

        let requestConfig = {
            strictSSL: false,
            headers: { "Content-Type": "application/json" },
            json: {
                token: access_token.access_token
            }
        };
        
        return new Promise((resolve, reject) => {
            request.post(`${this.baseUrl}/register/${uuid}`, requestConfig, (error, response, body) => {
                if (error) {
                    whitelistServiceLogger.info("error during linking...");
                    reject(error);
                } else {
                    if (response.statusCode !== 200) {
                        whitelistServiceLogger.info("error during linking...");
                        reject(response.statusCode);
                    } else {
                        whitelistServiceLogger.info("link account successful...");
                        resolve();
                    }
                }
            });
        });
    }
}

const whitelistService = new WhitelistService();

exports.whitelistService = whitelistService;
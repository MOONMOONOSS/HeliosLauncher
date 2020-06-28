// Using from global scope (documented for visibility)
// const ConfigManager = require('../../assets/js/configmanager.js') 
// switchView()

//Requires
const { whitelistService } = require("./assets/js/whitelistservice");
const whitelistStatusControllerLogger = LoggerUtil("%c[whitelistStatusController]", "color: #ff71ce; font-weight: bold");

class WhitelistStatusController {
    constructor() {
        whitelistStatusControllerLogger.info("Constructing...");

        //Elements
        this.loginButton = document.getElementById("discord_login");
        this.loginStatus = document.getElementById("whitelist_login_status");

        //Init methods
        this._setupListeners();
    }

    /**
     * _setupListeners
     * 
     * Establishes event listeners
     */
    _setupListeners() {
        whitelistStatusControllerLogger.info("Setting up Listeners...");
        document.getElementById("discord_login").onclick = () => {
            this.checkStatus();
        };
    }

    /**
     * _ensureToken
     * 
     * Checks if a token exists, otherwise starts the OAuth flow
     * Resets stored token in the event of OAuth flow failure
     * 
     * @returns {boolean} successful if request didn't error
     */
    async _ensureToken() {
        whitelistStatusControllerLogger.info("Checking that we have a token...");
        let isSuccessful = true;
        if (ConfigManager.getWhitelistToken() === null) {
            try {
                document.getElementById("whitelist_login_status").innerText = "Continue on the pop-up window...";
                let code = await whitelistService.requestCode();
                ConfigManager.updateWhitelistToken(await whitelistService.requestToken(code));
            } catch (error) {
                ConfigManager.updateWhitelistToken(null);
                isSuccessful = false;
            }
        }
        ConfigManager.save();
        return isSuccessful;
    }

    /**
     * _linkAccount
     * 
     * Wrapper for service method that resolves pass/fail for the operation
     * Additionally clears the entire token in the case of failure
     * 
     * @returns {boolean} successful if request didn't error
     */
    async _refreshToken() {
        whitelistStatusControllerLogger.info("Trying to refresh token...");
        let isSuccessful = true;
        try {
            ConfigManager.updateWhitelistToken(await whitelistService.refreshToken(ConfigManager.getWhitelistToken()));
        } catch (error) {
            ConfigManager.updateWhitelistToken(null);
            isSuccessful = false;
        }
        ConfigManager.save();
        return isSuccessful;
    }

    /**
     * _linkAccount
     * 
     * Wrapper for service method that resolves pass/fail for the operation
     * 
     * @returns {boolean} successful if request didn't error
     */
    async _linkAccount() {
        whitelistStatusControllerLogger.info("Trying to link account...");
        let isSuccessful = true;
        try {
            await whitelistService.linkAccount(ConfigManager.getWhitelistToken(), ConfigManager.getSelectedAccount().uuid);
        } catch (error) {
            isSuccessful = false;
        }
        return isSuccessful;
    }

    /**
     * _verifySameAccount
     * 
     * Strips hypens from the uuids and compares them
     * 
     * @param {object} status the status response including uuid
     * @param {object} account the current account to match uuid with
     * @returns {boolean} match if the uuids match
     */
    _verifySameAccount(status, account){
        let strippedStatus = status.uuid.replace(/-/g, "")
        let selectedAccount = account.uuid.replace(/-/g, "")
        return strippedStatus === selectedAccount
    }

    /**
     * checkStatus
     * 
     * Overall Flow:
     *      Ensure we have a token or get one via Oauth flow
     *      
     *      Leverage token to request status
     *          If successful in getting status, verify UUID and Standing
     *              Relink and retry if necessary
     *          If fetching status fails, check error code and attempt to resolve up to max retries
     *              If stale token, refresh and retry
     *              If unlinked, link and retry
     * 
     *      Ultimately, persist state to file and send to Landing View or Whitelist View with button to retry
     * 
     * 
     * @param {number} retries number of times we'll rerun before erroring out for too many attempts
     */
    async checkStatus(retries = 0) {
        whitelistStatusControllerLogger.info("Checking Status...");
        const RETRY_LIMIT = 3;
        const STALE_TOKEN = 403;
        const UNLINKED = 404;

        this.loginButton.style.display = "none";
        this.loginStatus.style.display = "flex";

        let tokenReady = await this._ensureToken();
        if (tokenReady) {
            try {
                whitelistStatusControllerLogger.info("Token exists, attempting to update status...");
                document.getElementById("whitelist_login_status").innerText = "Attempting to get status...";

                ConfigManager.updateWhitelistStatus(await whitelistService.getWhitelistStatus(ConfigManager.getWhitelistToken()));

                if (this._verifySameAccount(ConfigManager.getWhitelistStatus(), ConfigManager.getSelectedAccount())) {
                    if (ConfigManager.getWhitelistStatus().status === 0) {
                        document.getElementById("whitelist_login_status").innerText = "Whitelist successful! Completing login...";
                        lotteryController._init()
                        switchView(getCurrentView(), VIEWS.landing);
                    } else {
                        document.getElementById("whitelist_login_status").innerText = "Account not permitted...";
                    }
                } else {
                    whitelistStatusControllerLogger.info("Different Account Linked. Linking this one...");
                    document.getElementById("whitelist_login_status").innerText = "Different Account Linked. Linking this account...";

                    let linkingSuccessful = await this._linkAccount();
                    if (retries > RETRY_LIMIT) {
                        ConfigManager.updateWhitelistToken(null);
                        ConfigManager.updateWhitelistStatus(null);
                        document.getElementById("whitelist_login_status").innerText = "Too many failed Attempts...";
                    } else {
                        this.checkStatus(++retries);
                    }
                }
            } catch (error) {
                whitelistStatusControllerLogger.info("Error checking status, code:", error);

                if (error === STALE_TOKEN) {
                    whitelistStatusControllerLogger.info("Updating token, then retrying...");
                    document.getElementById("whitelist_login_status").innerText = "Refreshing Token...";

                    let refreshSuccessful = await this._refreshToken();
                    if (retries > RETRY_LIMIT) {
                        ConfigManager.updateWhitelistToken(null);
                        ConfigManager.updateWhitelistStatus(null);
                        document.getElementById("whitelist_login_status").innerText = "Too many failed Attempts...";

                    } else {
                        this.checkStatus(++retries);
                    }
                } else if (error === UNLINKED) {
                    whitelistStatusControllerLogger.info("Error checking status, linking account...");
                    document.getElementById("whitelist_login_status").innerText = "Linking Account...";

                    let linkingSuccessful = await this._linkAccount();
                    if (retries > RETRY_LIMIT) {
                        ConfigManager.updateWhitelistToken(null);
                        ConfigManager.updateWhitelistStatus(null);
                        document.getElementById("whitelist_login_status").innerText = "Too many failed Attempts...";
                    } else {
                        this.checkStatus(++retries);
                    }
                }
            }
        } else {
            document.getElementById("whitelist_login_status").innerText = "Error logging into Discord";
        }

        if (ConfigManager.getWhitelistStatus() === null || ConfigManager.getWhitelistStatus().status !== 0) {
            this.loginButton.innerText = "Click here to try again";
            this.loginButton.style.display = "flex";

        } else {
            // Successfully Whitelisted. Timeout to allow the fade to landing to happen, then reset ui
            setTimeout(()=>{
                document.getElementById("whitelist_login_status").innerText = "";
                this.loginButton.style.display = "flex";
            },2000)
        }
        ConfigManager.save();
    }
}

const whitelistStatusController = new WhitelistStatusController();

// const ConfigManager = require('../../assets/js/configmanager.js')  // using from global scope
const {
  WhitelistService,
} = require("./services/WhitelistService/WhitelistService");
const whitelistStatusControllerLogger = LoggerUtil(
  "%c[whitelistStatusController]",
  "color: #ff71ce; font-weight: bold"
);

//Prod
// const CLIENT_ID = "604009411928784917";
// const REDIRECT_URI = "https://localhost:8080/discord";
// const SCOPES = ["identify", "guilds"];
const CLIENT_ID = "714605338539720745"; 
const REDIRECT_URI = "https://localhost/callback";
const SCOPES = ["identify", "guilds"];
const whitelistService = new WhitelistService(CLIENT_ID, REDIRECT_URI, SCOPES);

class WhitelistStatusController {
  constructor() {
    whitelistStatusControllerLogger.debug("Constructing...");
    ConfigManager.updateWhitelistToken(null);
    ConfigManager.updateWhitelistStatusForCurrentAccount(null);

    this._updateState();
    this._setupListeners();
    this._scheduleIntervalJobs(10);
  }

  _setupListeners() {
    whitelistStatusControllerLogger.debug("Setting up Listeners...");
    document.getElementById("discord_login").onclick = () => {
      this.checkStatus();
    };
  }

  _scheduleIntervalJobs(minutes) {
    whitelistStatusControllerLogger.debug("Setting up Interval Polls...");

    const intervalTime = minutes * 60 * 1000;
    setInterval(async () => {
      whitelistStatusControllerLogger.debug("Refreshing Whitelist Status...");
      try {
        ConfigManager.updateWhitelistStatusForCurrentAccount(
          await this._getStatus()
        );
      } catch (error) {
        ConfigManager.updateWhitelistStatusForCurrentAccount(null);
      }
      this._updateState();
    }, intervalTime);
  }

  _setStateLoading() {
    whitelistStatusControllerLogger.debug("Setting State to Loading...");

    document.getElementById("whitelist_loading").style.display = "flex";
    document.getElementById("no_discord_token").style.display = "none";
    document.getElementById("has_discord_token").style.display = "none";
  }

  _setStateNoToken() {
    whitelistStatusControllerLogger.debug("Setting State to No Token...");

    document.getElementById("whitelist_loading").style.display = "none";
    document.getElementById("no_discord_token").style.display = "flex";
    document.getElementById("has_discord_token").style.display = "none";
  }

  _setStateShowStatus() {
    whitelistStatusControllerLogger.debug("Setting State to Show Status...");

    document.getElementById("whitelist_loading").style.display = "none";
    document.getElementById("no_discord_token").style.display = "none";
    document.getElementById("has_discord_token").style.display = "flex";
    // TODO: Draw Status
  }

  /**
   * Converts a Mojang status color to a hex value. Valid statuses
   * are 'green', 'yellow', 'red', and 'grey'. Grey is a custom status
   * to our project which represents an unknown status.
   *
   * @param {string} status A valid status code.
   * @returns {string} The hex color of the status code.
   */
  _statusToHex(status) {
    switch (status.toLowerCase()) {
      case "green":
        return "#a5c325";
      case "yellow":
        return "#eac918";
      case "red":
        return "#c32625";
      case "grey":
      default:
        return "#848484";
    }
  }

  _updateState() {
    whitelistStatusControllerLogger.debug("Updating component...");
    if (ConfigManager.getWhitelistStatusForCurrentAccount() !== null) {
      this._setStateShowStatus();
    } else {
      this._setStateNoToken();
    }
  }

  async checkStatus() {
    this._setStateLoading();
    whitelistStatusControllerLogger.debug("Checking status...");

    if (ConfigManager.getWhitelistToken() !== null) {
      try {
        whitelistStatusControllerLogger.debug("Attempting to use token for status...");
        ConfigManager.updateWhitelistStatusForCurrentAccount(await this._getStatus());
      } catch (error) {
          whitelistStatusControllerLogger.debug("Error using token. Trying to refresh and use...");
        try {
          ConfigManager.updateWhitelistToken(null);
          ConfigManager.updateWhitelistToken(await this._refreshToken());
          ConfigManager.updateWhitelistStatusForCurrentAccount(await this._getStatus());
        } catch (error) {
          whitelistStatusControllerLogger.debug("refresh failed, ending status attempt...");
          ConfigManager.updateWhitelistToken(null);
          ConfigManager.updateWhitelistStatusForCurrentAccount(null);
        }
      }
    } else {
      whitelistStatusControllerLogger.debug("No Token, requesting one...");
      try {
        ConfigManager.updateWhitelistToken(await this._getToken());
        ConfigManager.updateWhitelistStatusForCurrentAccount(await this._getStatus());
      } catch (error) {
        whitelistStatusControllerLogger.debug("Code for Token Exchanged Failed, ending status attempt...");
        ConfigManager.updateWhitelistToken(null);
        ConfigManager.updateWhitelistStatusForCurrentAccount(null);
        ConfigManager.save();
      }
    }

    ConfigManager.save();
    this._updateState();
  }

  async _getToken() {
    whitelistStatusControllerLogger.debug("Getting token...");

    if (ConfigManager.getWhitelistToken() === null) {
      let code = await whitelistService.requestCode();
      return await whitelistService.requestToken(code);
    } else {
      return ConfigManager.getWhitelistToken();
    }
  }

  async _getStatus() {
    await whitelistService.linkAccount(ConfigManager.getWhitelistToken(),ConfigManager.getSelectedAccount().uuid);
    return await whitelistService.getWhitelistStatus(ConfigManager.getWhitelistToken());
  }

  async _refreshToken(){
    return await whitelistService.refreshToken(ConfigManager.getWhitelistToken());
  }
}
const whitelistStatusController = new WhitelistStatusController();

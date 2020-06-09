// Using from global scope (documented for visibility)
// const ConfigManager = require('../../assets/js/configmanager.js')

//Requires
const { lotteryService } = require("./assets/js/lotteryapiservice");
// const { whitelistService } = require("./assets/js/whitelistservice");

const lotteryControllerLogger = LoggerUtil("%c[lotteryControllerLogger]", "color: #ff71ce; font-weight: bold");

class LotteryController {
    constructor() {
        lotteryControllerLogger.info("Constructing...");

        //TODO: Refactor into service with lottery specific callbacks
        this.wsBaseUrl = "ws://panel.moonmoon.live:8180/ws/v2/consumer/non-persistent/moonmoon/lottery/drawings";
        this.lotteryWs = null;

        //Elements
        this.lotteryConnectEle = document.getElementById("lotteryConnect");
        this.lotteryClosedEle = document.getElementById("lotteryClosed");
        this.lotteryOpenEle = document.getElementById("lotteryOpen");
        this.lotteryJoinedEle = document.getElementById("lotteryJoined");
        this.lotteryWinEle = document.getElementById("lotteryWin");

        //State Variables
        this.lotteryOpen = false;
        this.inLottery = false;
        this.lotteryWin = false;

        //Init methods
        this._setupListeners();

        // Init if able
        if (ConfigManager.getSelectedAccount() !== null && ConfigManager.getWhitelistToken() !== null && ConfigManager.getWhitelistStatus() !== null && ConfigManager.getWhitelistStatus().status !== 1) {
            this._init();
        }
    }

    /**
     * _setupListeners
     *
     * Establishes event listeners
     */
    _setupListeners() {
        lotteryControllerLogger.info("Setting up Listeners...");
        document.getElementById("lotteryConnect").onclick = () => {
            lotteryControllerLogger.info("Connect Clicked...");
            this._init();
        };
        document.getElementById("lotteryJoin").onclick = () => {
            lotteryControllerLogger.info("Join Clicked...");
            lotteryJoin.disabled = true
            this.join();
        };
    }

    _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async _init() {
        lotteryControllerLogger.info("Initializing Lottery Controller...");

        //clear any existing socket connection
        if (this.lotteryWs) {
            this.lotteryWs.close();
            this.lotteryWs = null;
        }

        //Initialize state variables
        this.lotteryOpen = false;
        this.inLottery = false;
        this.lotteryWin = false;

        this.lotteryWin = ConfigManager.getLotteryStatus(ConfigManager.getSelectedAccount().uuid) !== null;

        //Connect to websocket
        this._connectWs(ConfigManager.getSelectedAccount().uuid);

        //Initialize Status
        this.lotteryOpen = this.checkStatus();

        this._updateUI();
    }

    _connectWs(uuid) {
        lotteryControllerLogger.info("Connecting to Socket...");
        this.lotteryWs = new WebSocket(`${this.wsBaseUrl}/${uuid}`);
        this.lotteryWs.onopen = this._onWsOpen.bind(this);
        this.lotteryWs.onmessage = this._onWsMessage.bind(this);
        this.lotteryWs.onclose = this._onWsClose.bind(this);
        this.lotteryWs.onerror = this._onWsError.bind(this);
    }

    _onWsOpen(event) {
        lotteryControllerLogger.info("Websocket Connected...");
    }

    _onWsMessage(event) {
        lotteryControllerLogger.info("Websocket Message Received...");
        const receiveMsg = JSON.parse(event.data);
        lotteryControllerLogger.info("Data:",receiveMsg);
        this.lotteryWs.send(JSON.stringify({messageId: receiveMsg.messageId}))
        const message = JSON.parse(new Buffer(receiveMsg.payload, "base64").toString());
        switch (message.type) {
            case "open":
                this._handleLotteryOpen();
                break;
            case "close":
                this._handleLotteryClose();
                break;
            case "clearLotto":
                this._handleLotteryClear();
                break;
            case "draw":
                if (message.uuid === ConfigManager.getSelectedAccount().uuid) {
                    this._handleLotteryPicked();
                } else {
                    this._handleLotteryNotPicked();
                }
                break;
        }
    }

    _onWsClose(event) {
        lotteryControllerLogger.info("Websocket Closing...");
        if (this.lotteryWs) {
            this.lotteryWs.close();
            this.lotteryWs = null;
        }
        clearInterval(this.heartBeat);
        this.checkStatus();
        this.inLottery = false;
        this._updateUI();
    }

    _onWsError(event) {
        lotteryControllerLogger.info("Websocket Errored...");
        if (this.lotteryWs) {
            this.lotteryWs.close();
            this.lotteryWs = null;
        }
        clearInterval(this.heartBeat);
        this.checkStatus();
        this.inLottery = false;
        this._updateUI();
    }

    _handleLotteryOpen() {
        lotteryControllerLogger.info("Handling Lottery Opening...");
        this.lotteryOpen = true;
        this._updateUI();
    }

    _handleLotteryClose() {
        lotteryControllerLogger.info("Handling Lottery Closing...");
        this.inLottery = false;
        this.lotteryOpen = false;
        this._updateUI();
    }

    _handleLotteryClear(){
        lotteryControllerLogger.info("Handling Lottery Clearing...");
        ConfigManager.updateLotteryStatus(ConfigManager.getSelectedAccount().uuid, null);
        ConfigManager.save();
        this.inLottery = false;
        this.lotteryOpen = false;
        this._updateUI();
    }

    async _handleLotteryPicked() {
        lotteryControllerLogger.info("I WAS PICKED, POGGERS");
        if (confirm("Yay, you were picked. Do you want to join?\n You have 1 minute to accept :moon2S:")) {
            try {
                let status = await this.ack();
                this.lotteryWin = true;
                ConfigManager.updateLotteryStatus(ConfigManager.getSelectedAccount().uuid, status);
                ConfigManager.save();
            } catch (error) {
                lotteryControllerLogger.info("Errored, closing...");
                this.lotteryWin = false;
                this.inLottery = false;
            }
        } else {
            lotteryControllerLogger.info("Denied...wha?");
            this.lotteryWin = false;
            this.inLottery = false;
        }
        this._updateUI();
    }

    _handleLotteryNotPicked() {
        lotteryControllerLogger.info("Someone was picked....and it wasn't you...pepehands");
        // alert("Sorry, you werent picked");
    }

    _updateUI() {
        lotteryControllerLogger.info("Updating UI");
        if (this.lotteryWin) {
            let status = ConfigManager.getLotteryStatus(ConfigManager.getSelectedAccount().uuid)
            let displayMessage = status.msg.replace("#{}" , status.serverIp)
            this.lotteryWinEle.innerText = `${displayMessage}`;
            this.lotteryConnectEle.style.display = "none";
            this.lotteryClosedEle.style.display = "none";
            this.lotteryOpenEle.style.display = "none";
            this.lotteryJoinedEle.style.display = "none";
            this.lotteryWinEle.style.display = "flex";
        } else if (this.inLottery) {
            this.lotteryConnectEle.style.display = "none";
            this.lotteryClosedEle.style.display = "none";
            this.lotteryOpenEle.style.display = "none";
            this.lotteryJoinedEle.style.display = "flex";
            this.lotteryWinEle.style.display = "none";
        } else if (this.lotteryOpen) {
            this.lotteryConnectEle.style.display = "none";
            this.lotteryClosedEle.style.display = "none";
            this.lotteryOpenEle.style.display = "flex";
            this.lotteryJoinedEle.style.display = "none";
            this.lotteryWinEle.style.display = "none";
        } else if (!this.lotteryOpen && this.lotteryWs !== null) {
            this.lotteryConnectEle.style.display = "none";
            this.lotteryClosedEle.style.display = "flex";
            this.lotteryOpenEle.style.display = "none";
            this.lotteryJoinedEle.style.display = "none";
            this.lotteryWinEle.style.display = "none";
        } else {
            this.lotteryConnectEle.style.display = "flex";
            this.lotteryClosedEle.style.display = "none";
            this.lotteryOpenEle.style.display = "none";
            this.lotteryJoinedEle.style.display = "none";
            this.lotteryWinEle.style.display = "none";
        }
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
        lotteryControllerLogger.info("Checking that we have a token...");
        let isSuccessful = true;
        if (ConfigManager.getWhitelistToken() === null) {
            try {
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
        lotteryControllerLogger.info("Trying to refresh token...");
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
     * checkStatus
     *
     * @param {number} retries number of times we'll rerun before erroring out for too many attempts
     */
    async checkStatus(retries = 0) {
        lotteryControllerLogger.info("Checking Status...");
        const RETRY_LIMIT = 3;
        const STALE_TOKEN = 403;

        let tokenReady = await this._ensureToken();
        if (tokenReady) {
            try {
                lotteryControllerLogger.info("Token exists, attempting to update status...");
                let status = await lotteryService.getStatus(ConfigManager.getWhitelistToken());
                this.lotteryOpen = status.open;
            } catch (error) {
                lotteryControllerLogger.info("Error checking status, code:", error);

                if (error === STALE_TOKEN) {
                    lotteryControllerLogger.info("Updating token, then retrying...");
                    document.getElementById("whitelist_login_status").innerText = "Refreshing Token...";

                    let refreshSuccessful = await this._refreshToken();
                    if (retries > RETRY_LIMIT) {
                        ConfigManager.updateWhitelistToken(null);
                        ConfigManager.updateWhitelistStatus(null);
                        this.lotteryOpen = false;
                    } else {
                        this.checkStatus(++retries);
                    }
                }
            }
        } else {
            lotteryControllerLogger.info("Error Getting Status, assuming lottery closed for now...");
            this.lotteryOpen = false;
        }

        ConfigManager.save();
        this._updateUI();
    }

    /**
     * Join Lottery
     *
     * @param {number} retries number of times we'll rerun before erroring out for too many attempts
     */
    async join(retries = 0) {
        lotteryControllerLogger.info("Joining Lottery...");
        const RETRY_LIMIT = 3;
        const STALE_TOKEN = 403;
        const LOTTERY_CLOSED = 410;

        let tokenReady = await this._ensureToken();
        if (tokenReady) {
            try {
                lotteryControllerLogger.info("Token exists, attempting to Join...");
                await lotteryService.join(ConfigManager.getWhitelistToken());
                this.inLottery = true;
                lotteryJoin.disabled = false
                this._updateUI();
            } catch (error) {
                lotteryControllerLogger.info("Error trying to join, code:", error);

                if (error === STALE_TOKEN) {
                    lotteryControllerLogger.info("Updating token, then retrying...");
                    let refreshSuccessful = await this._refreshToken();
                    if (retries > RETRY_LIMIT) {
                        ConfigManager.updateWhitelistToken(null);
                        ConfigManager.updateWhitelistStatus(null);
                    } else {
                        this.checkStatus(++retries);
                    }
                } else if (error === LOTTERY_CLOSED) {
                    lotteryControllerLogger.info("Lottery is closed dummy...");
                } else {
                    lotteryControllerLogger.info("some other error...");
                }
            }
        } else {
            lotteryControllerLogger.info("Error Getting Status");
        }

        setTimeout(()=>{lotteryJoin.disabled = false}, 5000)
        ConfigManager.save();
    }

    /**
     * Acknowledge Lottery Win
     *
     * @param {number} retries number of times we'll rerun before erroring out for too many attempts
     */
    async ack(retries = 0) {
        lotteryControllerLogger.info("Acknowledging Win...");
        const RETRY_LIMIT = 3;
        const STALE_TOKEN = 403;
        const NOT_FOUND = 404;

        let tokenReady = await this._ensureToken();
        if (tokenReady) {
            try {
                lotteryControllerLogger.info("Token exists, attempting to Join...");
                return await lotteryService.ack(ConfigManager.getWhitelistToken());
            } catch (error) {
                lotteryControllerLogger.info("Error checking status, code:", error);

                if (error === STALE_TOKEN) {
                    lotteryControllerLogger.info("Updating token, then retrying...");
                    let refreshSuccessful = await this._refreshToken();
                    if (retries > RETRY_LIMIT) {
                        ConfigManager.updateWhitelistToken(null);
                        ConfigManager.updateWhitelistStatus(null);
                    } else {
                        this.checkStatus(++retries);
                    }
                } else if (error === NOT_FOUND) {
                    lotteryControllerLogger.info("Ack failed - not found...");
                    throw "Ack Failed - Not Found";
                } else {
                    lotteryControllerLogger.info("some other error...");
                    throw "Ack Failed - Unknown";
                }
            }
        } else {
            lotteryControllerLogger.info("Error asserting token exists");
            throw "Ack Failed - No Token";
        }

        ConfigManager.save();
    }
}

const lotteryController = new LotteryController();

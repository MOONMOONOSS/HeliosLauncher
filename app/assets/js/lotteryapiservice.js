const url = require("url");
const request = require("request");

const lotteryApiServiceLogger = LoggerUtil("%c[LotteryApiServiceLogger]", "color: #ffffff; font-weight: bold");

class LotteryApiService {
    constructor() {
        lotteryApiServiceLogger.info("Constructing...");
        this.baseUrl = "https://panel.moonmoon.live:8000/v1"
    }
   
    /**
     * getStatus
     * 
     * Gets the current lottery status - Open or Closed
     * 
     * @param {object} access_token containing the sub access_token
     * @param {boolean} isOpen whether or not the lottery is open
     */
    getStatus(access_token) {
        lotteryApiServiceLogger.info("Getting Status...");

        let requestConfig = {
            strictSSL: false,
            headers: { "Content-Type": "application/json" },
            json: {
                token: access_token.access_token
            }
        };
        
        return new Promise((resolve, reject) => {
            request.get(`${this.baseUrl}/lottery/status`, requestConfig, (error, response, body) => {
                if (error) {
                    lotteryApiServiceLogger.info("error while getting status...");
                    reject(error);
                } else {
                    if (response.statusCode !== 200) {
                        lotteryApiServiceLogger.info("error while getting status...");
                        reject(response.statusCode);
                    } else {
                        lotteryApiServiceLogger.info("status received...");
                        resolve(body);
                    }
                }
            });
        });
    }

    /**
     * join
     * 
     * Attempts to join the waitlist
     * 
     * @param {object} access_token containing the sub access_token
     */
    join(access_token) {
        lotteryApiServiceLogger.info("joining lotto...");

        let requestConfig = {
            strictSSL: false,
            headers: { "Content-Type": "application/json" },
            json: {
                token: access_token.access_token
            }
        };
        
        return new Promise((resolve, reject) => {
            request.put(`${this.baseUrl}/lottery/join`, requestConfig, (error, response, body) => {
                if (error) {
                    lotteryApiServiceLogger.info("error while joining - error...");
                    reject(error);
                } else {
                    lotteryApiServiceLogger.info("Status...", response.statusCode);

                    if (response.statusCode !== 202 && response.statusCode !== 418) {
                        lotteryApiServiceLogger.info("error while joining - status...");
                        reject(response.statusCode);
                    } else {
                        lotteryApiServiceLogger.info("link account successful...");
                        resolve(response.statusCode);
                    }
                }
            });
        });
    }

    /**
     * ack
     * 
     * Acknowledge lottery win
     * 
     * @param {object} access_token containing the sub access_token
     */
    ack(access_token) {
        lotteryApiServiceLogger.info("acknowledging lotto win...");

        let requestConfig = {
            strictSSL: false,
            headers: { "Content-Type": "application/json" },
            json: {
                token: access_token.access_token
            }
        };
        
        return new Promise((resolve, reject) => {
            request.post(`${this.baseUrl}/lottery/ack`, requestConfig, (error, response, body) => {
                if (error) {
                    lotteryApiServiceLogger.info("error acknowledging lotto win...");
                    reject(error);
                } else {
                    if (response.statusCode !== 200) {
                        lotteryApiServiceLogger.info("error acknowledging lotto win...");
                        reject(response.statusCode);
                    } else {
                        lotteryApiServiceLogger.info("acknowledged successfully...");
                        resolve(body);
                    }
                }
            });
        });
    }   
}
const lotteryService = new LotteryApiService();
exports.lotteryService = lotteryService;
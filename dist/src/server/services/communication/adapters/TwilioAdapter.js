"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
class TwilioAdapter extends types_1.CommunicationAdapter {
    constructor(config) {
        super();
        this.config = config;
    }
    async send(options) {
        const { accountSid, authToken, senderId } = this.config;
        const { recipient, message } = options;
        if (!accountSid || !authToken || !senderId) {
            return { success: false, error: 'Twilio configuration is missing SID, Token, or Sender ID' };
        }
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        try {
            const response = await axios_1.default.post(url, new URLSearchParams({
                From: senderId,
                To: recipient,
                Body: message,
            }), {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return {
                success: true,
                messageId: response.data.sid,
                rawResponse: response.data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                rawResponse: error.response?.data,
            };
        }
    }
}
exports.TwilioAdapter = TwilioAdapter;

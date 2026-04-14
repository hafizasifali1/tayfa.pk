"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppCloudAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
class WhatsAppCloudAdapter extends types_1.CommunicationAdapter {
    constructor(config) {
        super();
        this.config = config;
    }
    async send(options) {
        const { phoneNumberId, accessToken } = this.config;
        const { recipient, message } = options;
        if (!phoneNumberId || !accessToken) {
            return { success: false, error: 'WhatsApp Cloud API configuration is missing Phone Number ID or Access Token' };
        }
        const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
        try {
            const response = await axios_1.default.post(url, {
                messaging_product: 'whatsapp',
                to: recipient,
                type: 'text',
                text: { body: message },
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                success: true,
                messageId: response.data.messages?.[0]?.id,
                rawResponse: response.data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message,
                rawResponse: error.response?.data,
            };
        }
    }
}
exports.WhatsAppCloudAdapter = WhatsAppCloudAdapter;

import axios from 'axios';
import { CommunicationAdapter, CommunicationProviderConfig, SendMessageOptions, CommunicationResponse } from '../types';

export class TwilioAdapter extends CommunicationAdapter {
  private config: CommunicationProviderConfig;

  constructor(config: CommunicationProviderConfig) {
    super();
    this.config = config;
  }

  async send(options: SendMessageOptions): Promise<CommunicationResponse> {
    const { accountSid, authToken, senderId } = this.config;
    const { recipient, message } = options;

    if (!accountSid || !authToken || !senderId) {
      return { success: false, error: 'Twilio configuration is missing SID, Token, or Sender ID' };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    try {
      const response = await axios.post(
        url,
        new URLSearchParams({
          From: senderId,
          To: recipient,
          Body: message,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.sid,
        rawResponse: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        rawResponse: error.response?.data,
      };
    }
  }
}

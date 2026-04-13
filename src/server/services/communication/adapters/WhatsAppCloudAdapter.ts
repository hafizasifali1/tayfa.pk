import axios from 'axios';
import { CommunicationAdapter, CommunicationProviderConfig, SendMessageOptions, CommunicationResponse } from '../types';

export class WhatsAppCloudAdapter extends CommunicationAdapter {
  private config: CommunicationProviderConfig;

  constructor(config: CommunicationProviderConfig) {
    super();
    this.config = config;
  }

  async send(options: SendMessageOptions): Promise<CommunicationResponse> {
    const { phoneNumberId, accessToken } = this.config;
    const { recipient, message } = options;

    if (!phoneNumberId || !accessToken) {
      return { success: false, error: 'WhatsApp Cloud API configuration is missing Phone Number ID or Access Token' };
    }

    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

    try {
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        rawResponse: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        rawResponse: error.response?.data,
      };
    }
  }
}

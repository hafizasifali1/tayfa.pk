export type CommunicationType = 'sms' | 'whatsapp';

export interface CommunicationProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  accountSid?: string;
  authToken?: string;
  phoneNumberId?: string;
  accessToken?: string;
  endpointUrl?: string;
  senderId?: string;
}

export interface SendMessageOptions {
  recipient: string;
  message: string;
  templateId?: string;
  metadata?: any;
}

export interface CommunicationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  rawResponse?: any;
}

export abstract class CommunicationAdapter {
  abstract send(options: SendMessageOptions): Promise<CommunicationResponse>;
}

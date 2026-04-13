import { db } from '../../../db';
import { communicationProviders, communicationTemplates, communicationLogs } from '../../../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { CommunicationType, SendMessageOptions, CommunicationResponse, CommunicationAdapter } from './types';
import { TwilioAdapter } from './adapters/TwilioAdapter';
import { WhatsAppCloudAdapter } from './adapters/WhatsAppCloudAdapter';
import { decrypt } from '../../utils/encryption';

export class CommunicationService {
  private static getAdapter(name: string, config: any): CommunicationAdapter | null {
    // Decrypt sensitive config fields
    const decryptedConfig = { ...config };
    for (const key in decryptedConfig) {
      if (typeof decryptedConfig[key] === 'string' && decryptedConfig[key].includes(':')) {
        try {
          decryptedConfig[key] = decrypt(decryptedConfig[key]);
        } catch (e) {
          // If decryption fails, assume it's not encrypted or use as is
        }
      }
    }

    switch (name.toLowerCase()) {
      case 'twilio':
        return new TwilioAdapter(decryptedConfig);
      case 'whatsapp_cloud_api':
        return new WhatsAppCloudAdapter(decryptedConfig);
      default:
        return null;
    }
  }

  static async sendMessage(type: CommunicationType, options: SendMessageOptions): Promise<CommunicationResponse> {
    // 1. Load active providers for the given type, ordered by priority
    const providers = await db
      .select()
      .from(communicationProviders)
      .where(and(eq(communicationProviders.type, type), eq(communicationProviders.isActive, true)))
      .orderBy(asc(communicationProviders.priority));

    if (providers.length === 0) {
      return { success: false, error: `No active ${type} providers found.` };
    }

    let lastError = '';
    for (const provider of providers) {
      const adapter = this.getAdapter(provider.name, provider.config);
      if (!adapter) {
        console.error(`Adapter not found for provider: ${provider.name}`);
        continue;
      }

      const response = await adapter.send(options);

      // 2. Log the attempt
      await db.insert(communicationLogs).values({
        providerId: provider.id,
        templateId: options.templateId,
        recipient: options.recipient,
        message: options.message,
        status: response.success ? 'sent' : 'failed',
        error: response.error,
        metadata: response.rawResponse,
      });

      if (response.success) {
        return response;
      }

      lastError = response.error || 'Unknown error';
      console.warn(`Provider ${provider.name} failed: ${lastError}. Trying next provider...`);
    }

    return { success: false, error: `All ${type} providers failed. Last error: ${lastError}` };
  }

  static async sendTemplatedMessage(type: CommunicationType, templateName: string, recipient: string, variables: Record<string, string>): Promise<CommunicationResponse> {
    // 1. Load template
    const [template] = await db
      .select()
      .from(communicationTemplates)
      .where(and(eq(communicationTemplates.name, templateName), eq(communicationTemplates.type, type), eq(communicationTemplates.isActive, true)))
      .limit(1);

    if (!template) {
      return { success: false, error: `Template ${templateName} for ${type} not found.` };
    }

    // 2. Replace variables
    let message = template.content;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    // 3. Send message
    return this.sendMessage(type, {
      recipient,
      message,
      templateId: template.id,
    });
  }
}

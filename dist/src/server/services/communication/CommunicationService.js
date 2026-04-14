"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationService = void 0;
const db_1 = require("../../../db");
const schema_1 = require("../../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const TwilioAdapter_1 = require("./adapters/TwilioAdapter");
const WhatsAppCloudAdapter_1 = require("./adapters/WhatsAppCloudAdapter");
const encryption_1 = require("../../utils/encryption");
class CommunicationService {
    static getAdapter(name, config) {
        // Decrypt sensitive config fields
        const decryptedConfig = { ...config };
        for (const key in decryptedConfig) {
            if (typeof decryptedConfig[key] === 'string' && decryptedConfig[key].includes(':')) {
                try {
                    decryptedConfig[key] = (0, encryption_1.decrypt)(decryptedConfig[key]);
                }
                catch (e) {
                    // If decryption fails, assume it's not encrypted or use as is
                }
            }
        }
        switch (name.toLowerCase()) {
            case 'twilio':
                return new TwilioAdapter_1.TwilioAdapter(decryptedConfig);
            case 'whatsapp_cloud_api':
                return new WhatsAppCloudAdapter_1.WhatsAppCloudAdapter(decryptedConfig);
            default:
                return null;
        }
    }
    static async sendMessage(type, options) {
        // 1. Load active providers for the given type, ordered by priority
        const providers = await db_1.db
            .select()
            .from(schema_1.communicationProviders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communicationProviders.type, type), (0, drizzle_orm_1.eq)(schema_1.communicationProviders.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.communicationProviders.priority));
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
            await db_1.db.insert(schema_1.communicationLogs).values({
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
    static async sendTemplatedMessage(type, templateName, recipient, variables) {
        // 1. Load template
        const [template] = await db_1.db
            .select()
            .from(schema_1.communicationTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communicationTemplates.name, templateName), (0, drizzle_orm_1.eq)(schema_1.communicationTemplates.type, type), (0, drizzle_orm_1.eq)(schema_1.communicationTemplates.isActive, true)))
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
exports.CommunicationService = CommunicationService;

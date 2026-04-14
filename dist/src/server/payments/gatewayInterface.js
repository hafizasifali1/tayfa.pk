"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODGateway = exports.PayPalGateway = exports.StripeGateway = void 0;
exports.getGateway = getGateway;
class StripeGateway {
    constructor() {
        this.code = 'stripe';
    }
    async initiatePayment(amount, currency, orderId, config) {
        // Mock Stripe implementation
        console.log(`[Stripe] Initiating payment for ${amount} ${currency} (Order: ${orderId})`);
        return {
            success: true,
            transactionId: `stripe_${Math.random().toString(36).substr(2, 9)}`,
            redirectUrl: `https://checkout.stripe.com/pay/${orderId}`,
            metadata: { provider: 'stripe' }
        };
    }
    async verifyPayment(transactionId, paymentData, config) {
        return { success: true, status: 'completed' };
    }
    async handleWebhook(payload, signature, config) {
        return { processed: true };
    }
}
exports.StripeGateway = StripeGateway;
class PayPalGateway {
    constructor() {
        this.code = 'paypal';
    }
    async initiatePayment(amount, currency, orderId, config) {
        console.log(`[PayPal] Initiating payment for ${amount} ${currency} (Order: ${orderId})`);
        return {
            success: true,
            transactionId: `paypal_${Math.random().toString(36).substr(2, 9)}`,
            redirectUrl: `https://paypal.com/checkout/${orderId}`,
            metadata: { provider: 'paypal' }
        };
    }
    async verifyPayment(transactionId, paymentData, config) {
        return { success: true, status: 'completed' };
    }
    async handleWebhook(payload, signature, config) {
        return { processed: true };
    }
}
exports.PayPalGateway = PayPalGateway;
class CODGateway {
    constructor() {
        this.code = 'cod';
    }
    async initiatePayment(amount, currency, orderId, config) {
        console.log(`[COD] Initiating payment for ${amount} ${currency} (Order: ${orderId})`);
        return {
            success: true,
            transactionId: `cod_${Math.random().toString(36).substr(2, 9)}`,
            message: 'Order placed successfully. Pay on delivery.',
            metadata: { provider: 'cod' }
        };
    }
    async verifyPayment(transactionId, paymentData, config) {
        return { success: true, status: 'pending' };
    }
    async handleWebhook(payload, signature, config) {
        return { processed: true };
    }
}
exports.CODGateway = CODGateway;
const gateways = {
    stripe: new StripeGateway(),
    paypal: new PayPalGateway(),
    cod: new CODGateway(),
};
function getGateway(code) {
    return gateways[code];
}

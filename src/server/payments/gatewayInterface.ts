export interface PaymentGateway {
  code: string;
  initiatePayment(amount: number, currency: string, orderId: string, config: Record<string, string>): Promise<{ 
    success: boolean; 
    transactionId: string; 
    redirectUrl?: string; 
    message?: string;
    metadata?: any;
  }>;
  verifyPayment(transactionId: string, paymentData: any, config: Record<string, string>): Promise<{ 
    success: boolean; 
    status: string;
    metadata?: any;
  }>;
  handleWebhook(payload: any, signature: string, config: Record<string, string>): Promise<{ 
    processed: boolean; 
    transactionId?: string; 
    status?: string;
  }>;
}

export class StripeGateway implements PaymentGateway {
  code = 'stripe';
  async initiatePayment(amount: number, currency: string, orderId: string, config: Record<string, string>) {
    // Mock Stripe implementation
    console.log(`[Stripe] Initiating payment for ${amount} ${currency} (Order: ${orderId})`);
    return {
      success: true,
      transactionId: `stripe_${Math.random().toString(36).substr(2, 9)}`,
      redirectUrl: `https://checkout.stripe.com/pay/${orderId}`,
      metadata: { provider: 'stripe' }
    };
  }
  async verifyPayment(transactionId: string, paymentData: any, config: Record<string, string>) {
    return { success: true, status: 'completed' };
  }
  async handleWebhook(payload: any, signature: string, config: Record<string, string>) {
    return { processed: true };
  }
}

export class PayPalGateway implements PaymentGateway {
  code = 'paypal';
  async initiatePayment(amount: number, currency: string, orderId: string, config: Record<string, string>) {
    console.log(`[PayPal] Initiating payment for ${amount} ${currency} (Order: ${orderId})`);
    return {
      success: true,
      transactionId: `paypal_${Math.random().toString(36).substr(2, 9)}`,
      redirectUrl: `https://paypal.com/checkout/${orderId}`,
      metadata: { provider: 'paypal' }
    };
  }
  async verifyPayment(transactionId: string, paymentData: any, config: Record<string, string>) {
    return { success: true, status: 'completed' };
  }
  async handleWebhook(payload: any, signature: string, config: Record<string, string>) {
    return { processed: true };
  }
}

export class CODGateway implements PaymentGateway {
  code = 'cod';
  async initiatePayment(amount: number, currency: string, orderId: string, config: Record<string, string>) {
    console.log(`[COD] Initiating payment for ${amount} ${currency} (Order: ${orderId})`);
    return {
      success: true,
      transactionId: `cod_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Order placed successfully. Pay on delivery.',
      metadata: { provider: 'cod' }
    };
  }
  async verifyPayment(transactionId: string, paymentData: any, config: Record<string, string>) {
    return { success: true, status: 'pending' };
  }
  async handleWebhook(payload: any, signature: string, config: Record<string, string>) {
    return { processed: true };
  }
}

const gateways: Record<string, PaymentGateway> = {
  stripe: new StripeGateway(),
  paypal: new PayPalGateway(),
  cod: new CODGateway(),
};

export function getGateway(code: string): PaymentGateway | undefined {
  return gateways[code];
}

/**
 * PayPal payment gateway - Template for production integration
 * Demonstrates how to add new gateways without modifying existing code
 */

const BasePaymentGateway = require('./BasePaymentGateway');

class PayPalPaymentGateway extends BasePaymentGateway {
  constructor(clientId = process.env.PAYPAL_CLIENT_ID, clientSecret = process.env.PAYPAL_CLIENT_SECRET) {
    super(clientId);
    this.clientSecret = clientSecret;
    this.gatewayName = 'PayPal';
    this.demoMode = !this.isConfigured();
  }

  async processPayment(paymentData) {
    const { amount, currency = 'USD', customerEmail, description, invoiceId } = paymentData;

    if (!amount || amount <= 0) {
      return this.formatResponse(false, null, 'Invalid payment amount', {
        error: 'Amount must be greater than 0',
      });
    }

    if (!customerEmail) {
      return this.formatResponse(false, null, 'Missing customer email', {
        error: 'Customer email is required for PayPal payments',
      });
    }

    try {
      if (this.demoMode) {
        return this.processDemoPayment(amount, currency, customerEmail, invoiceId);
      }

      // Production: requires @paypal/checkout-server-sdk
    } catch (error) {
      return this.formatResponse(false, null, 'Payment processing failed', {
        error: error.message,
      });
    }
  }

  processDemoPayment(amount, currency, customerEmail, invoiceId) {
    const transactionId = `paypal_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const approvalLink = `https://sandbox.paypal.com/checkoutnow?token=${transactionId}`;

    return Promise.resolve(
      this.formatResponse(true, transactionId, 'PayPal order created (Demo)', {
        amount,
        currency,
        customerEmail,
        invoiceId,
        status: 'CREATED',
        approvalLink,
        demo: true,
      })
    );
  }

  async verifyPayment(transactionId) {
    if (!transactionId) {
      return this.formatResponse(false, null, 'Transaction ID required', {
        verified: false,
      });
    }

    try {
      if (this.demoMode) {
        return this.formatResponse(true, transactionId, 'Payment verified', {
          verified: true,
          status: 'COMPLETED',
          demo: true,
        });
      }

      // Production code
    } catch (error) {
      return this.formatResponse(false, transactionId, 'Verification failed', {
        error: error.message,
        verified: false,
      });
    }
  }

  async refundPayment(transactionId, amount = null) {
    if (!transactionId) {
      return this.formatResponse(false, null, 'Transaction ID required', {
        refunded: false,
      });
    }

    try {
      if (this.demoMode) {
        const refundId = `paypal_ref_demo_${Date.now()}`;
        return this.formatResponse(true, refundId, 'Refund processed successfully (Demo)', {
          originalTransaction: transactionId,
          amount,
          refunded: true,
          demo: true,
        });
      }

      // Production code
    } catch (error) {
      return this.formatResponse(false, null, 'Refund failed', {
        error: error.message,
        refunded: false,
      });
    }
  }

  async getTransactionDetails(transactionId) {
    if (!transactionId) {
      return this.formatResponse(false, null, 'Transaction ID required');
    }

    try {
      if (this.demoMode) {
        return this.formatResponse(
          true,
          transactionId,
          'Transaction details retrieved (Demo)',
          {
            status: 'COMPLETED',
            amount: 49.99,
            currency: 'USD',
            created: new Date().toISOString(),
            demo: true,
          }
        );
      }

      // Production code
    } catch (error) {
      return this.formatResponse(false, transactionId, 'Failed to retrieve details', {
        error: error.message,
      });
    }
  }
}

module.exports = PayPalPaymentGateway;

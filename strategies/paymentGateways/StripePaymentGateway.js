/**
 * StripePaymentGateway - Stripe payment processing implementation
 * Real Stripe integration example (requires 'stripe' npm package)
 * In demo mode: simulates Stripe API responses
 */

const BasePaymentGateway = require('./BasePaymentGateway');

class StripePaymentGateway extends BasePaymentGateway {
  constructor(apiKey = process.env.STRIPE_API_KEY) {
    super(apiKey);
    this.gatewayName = 'Stripe';
    // In production: const stripe = require('stripe')(apiKey);
    // For now, we simulate Stripe responses
    this.demoMode = !this.isConfigured();
  }

  /**
   * Process payment via Stripe
   * In production, this would create a Stripe PaymentIntent
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  async processPayment(paymentData) {
    const { amount, currency = 'usd', customerEmail, description, invoiceId } =
      paymentData;

    if (!amount || amount <= 0) {
      return this.formatResponse(false, null, 'Invalid payment amount', {
        error: 'Amount must be greater than 0',
      });
    }

    if (!customerEmail) {
      return this.formatResponse(false, null, 'Missing customer email', {
        error: 'Customer email is required for Stripe payments',
      });
    }

    try {
      if (this.demoMode) {
        return this.processDemoPayment(amount, currency, customerEmail, invoiceId);
      }

      // Production code (requires 'npm install stripe')
      // const stripe = require('stripe')(this.apiKey);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(amount * 100), // Stripe uses cents
      //   currency,
      //   receipt_email: customerEmail,
      //   metadata: { invoiceId },
      //   description: description || `Invoice Payment`,
      // });
      //
      // return this.formatResponse(
      //   paymentIntent.status === 'succeeded',
      //   paymentIntent.id,
      //   'Payment processed successfully',
      //   { clientSecret: paymentIntent.client_secret }
      // );
    } catch (error) {
      return this.formatResponse(false, null, 'Payment processing failed', {
        error: error.message,
      });
    }
  }

  /**
   * Demo payment processing (simulates Stripe)
   * @private
   */
  processDemoPayment(amount, currency, customerEmail, invoiceId) {
    const transactionId = `ch_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return Promise.resolve(
      this.formatResponse(true, transactionId, 'Payment processed successfully (Demo)', {
        amount,
        currency,
        customerEmail,
        invoiceId,
        status: 'succeeded',
        demo: true,
        note: 'This is a demo transaction. In production, connect to real Stripe API.',
      })
    );
  }

  /**
   * Verify payment status
   * @param {string} transactionId
   * @returns {Promise<Object>}
   */
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
          status: 'succeeded',
          demo: true,
        });
      }

      // Production code:
      // const stripe = require('stripe')(this.apiKey);
      // const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
      // return this.formatResponse(
      //   paymentIntent.status === 'succeeded',
      //   transactionId,
      //   `Payment status: ${paymentIntent.status}`,
      //   { status: paymentIntent.status }
      // );
    } catch (error) {
      return this.formatResponse(false, transactionId, 'Verification failed', {
        error: error.message,
        verified: false,
      });
    }
  }

  /**
   * Refund a payment
   * @param {string} transactionId
   * @param {number} amount - Optional partial refund amount
   * @returns {Promise<Object>}
   */
  async refundPayment(transactionId, amount = null) {
    if (!transactionId) {
      return this.formatResponse(false, null, 'Transaction ID required', {
        refunded: false,
      });
    }

    try {
      if (this.demoMode) {
        const refundId = `ref_demo_${Date.now()}`;
        return this.formatResponse(true, refundId, 'Refund processed successfully (Demo)', {
          originalTransaction: transactionId,
          amount,
          refunded: true,
          demo: true,
        });
      }

      // Production code:
      // const stripe = require('stripe')(this.apiKey);
      // const refund = await stripe.refunds.create({
      //   charge: transactionId,
      //   amount: amount ? Math.round(amount * 100) : undefined,
      // });
      // return this.formatResponse(true, refund.id, 'Refund successful', {
      //   originalTransaction: transactionId,
      //   refundStatus: refund.status,
      // });
    } catch (error) {
      return this.formatResponse(false, null, 'Refund failed', {
        error: error.message,
        refunded: false,
      });
    }
  }

  /**
   * Get transaction details
   * @param {string} transactionId
   * @returns {Promise<Object>}
   */
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
            status: 'succeeded',
            amount: 4999,
            currency: 'usd',
            created: new Date().toISOString(),
            demo: true,
          }
        );
      }

      // Production code:
      // const stripe = require('stripe')(this.apiKey);
      // const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
      // return this.formatResponse(true, transactionId, 'Transaction details', {
      //   ...paymentIntent,
      // });
    } catch (error) {
      return this.formatResponse(false, transactionId, 'Failed to retrieve details', {
        error: error.message,
      });
    }
  }
}

module.exports = StripePaymentGateway;

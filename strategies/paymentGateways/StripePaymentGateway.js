/**
 * Stripe payment gateway - Real API integration with test mode support
 * Use test API key with card 4242 4242 4242 4242 for development
 */

const Stripe = require('stripe');
const BasePaymentGateway = require('./BasePaymentGateway');

class StripePaymentGateway extends BasePaymentGateway {
  constructor(apiKey = process.env.STRIPE_API_KEY) {
    super(apiKey);
    this.gatewayName = 'Stripe';
    this.stripe = this.isConfigured() ? new Stripe(this.apiKey) : null;
  }

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

    if (!this.stripe) {
      return this.formatResponse(false, null, 'Stripe is not configured', {
        error: 'Missing STRIPE_API_KEY in environment variables',
      });
    }

    try {
      // Create payment intent
      const amountCents = Math.round(amount * 100); // Stripe uses cents
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountCents,
        currency,
        description,
        metadata: {
          invoiceId: invoiceId || 'unknown',
          customerEmail,
        },
        receipt_email: customerEmail,
      });

      return this.formatResponse(true, paymentIntent.id, 'Payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        invoiceId,
      });
    } catch (error) {
      return this.formatResponse(false, null, 'Payment processing failed', {
        error: error.message,
      });
    }
  }

  async verifyPayment(transactionId) {
    if (!transactionId) {
      return this.formatResponse(false, null, 'Transaction ID required', {
        verified: false,
      });
    }

    if (!this.stripe) {
      return this.formatResponse(false, null, 'Stripe is not configured', {
        error: 'Missing STRIPE_API_KEY in environment variables',
      });
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);

      const verified = paymentIntent.status === 'succeeded';
      return this.formatResponse(
        verified,
        transactionId,
        `Payment ${paymentIntent.status}`,
        {
          verified,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          charges: paymentIntent.charges.data.map(c => ({
            id: c.id,
            status: c.status,
            amount: c.amount / 100,
          })),
        }
      );
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

    if (!this.stripe) {
      return this.formatResponse(false, null, 'Stripe is not configured', {
        error: 'Missing STRIPE_API_KEY in environment variables',
      });
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);

      if (!paymentIntent.charges.data.length) {
        return this.formatResponse(false, null, 'No charges found to refund', {
          refunded: false,
        });
      }

      const chargeId = paymentIntent.charges.data[0].id;
      const amountCents = amount ? Math.round(amount * 100) : null;

      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount: amountCents, // null means full refund
        reason: 'requested_by_customer',
        metadata: {
          originalPaymentIntent: transactionId,
        },
      });

      return this.formatResponse(true, refund.id, 'Refund processed successfully', {
        refundId: refund.id,
        chargeId,
        amount: refund.amount / 100,
        status: refund.status,
        originalTransaction: transactionId,
      });
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

    if (!this.stripe) {
      return this.formatResponse(false, null, 'Stripe is not configured', {
        error: 'Missing STRIPE_API_KEY in environment variables',
      });
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);

      return this.formatResponse(true, transactionId, 'Transaction details retrieved', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000).toISOString(),
        description: paymentIntent.description,
        charges: paymentIntent.charges.data.map(c => ({
          id: c.id,
          status: c.status,
          amount: c.amount / 100,
          receipt_url: c.receipt_url,
        })),
        refunds: paymentIntent.charges.data[0]
          ? paymentIntent.charges.data[0].refunds.data.map(r => ({
              id: r.id,
              amount: r.amount / 100,
              status: r.status,
            }))
          : [],
      });
    } catch (error) {
      return this.formatResponse(false, transactionId, 'Failed to retrieve details', {
        error: error.message,
      });
    }
  }
}

module.exports = StripePaymentGateway;

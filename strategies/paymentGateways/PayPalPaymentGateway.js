/**
 * PayPalPaymentGateway - PayPal payment processing implementation
 * Template showing how to add new payment gateways without modifying existing code
 * Demonstrates Open/Closed Principle: Open for extension, closed for modification
 * 
 * To use this in production:
 * 1. npm install @paypal/checkout-server-sdk
 * 2. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env
 * 3. Implement the actual PayPal API calls
 */

const BasePaymentGateway = require('./BasePaymentGateway');

class PayPalPaymentGateway extends BasePaymentGateway {
  constructor(clientId = process.env.PAYPAL_CLIENT_ID, clientSecret = process.env.PAYPAL_CLIENT_SECRET) {
    super(clientId);
    this.clientSecret = clientSecret;
    this.gatewayName = 'PayPal';
    this.demoMode = !this.isConfigured();
  }

  /**
   * Process payment via PayPal
   * In production, creates a PayPal Order and returns approval URL
   */
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

      // Production code (requires @paypal/checkout-server-sdk)
      // const client = new paypal.core.PayPalHttpClient(environment);
      // const createOrderRequest = new paypal.orders.OrdersCreateRequest();
      // createOrderRequest.prefer('return=representation');
      // createOrderRequest.requestBody({
      //   intent: 'CAPTURE',
      //   purchase_units: [
      //     {
      //       amount: {
      //         currency_code: currency,
      //         value: amount.toString(),
      //       },
      //     },
      //   ],
      //   payer: {
      //     email_address: customerEmail,
      //   },
      // });
      //
      // const order = await client.execute(createOrderRequest);
      // return this.formatResponse(order.result.status === 'CREATED', order.result.id, 'PayPal order created', {
      //   approvalLink: order.result.links.find(link => link.rel === 'approve').href,
      //   invoiceId,
      // });
    } catch (error) {
      return this.formatResponse(false, null, 'Payment processing failed', {
        error: error.message,
      });
    }
  }

  /**
   * Demo payment processing (simulates PayPal)
   * @private
   */
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
        note: 'This is a demo transaction. In production, connect to real PayPal API.',
      })
    );
  }

  /**
   * Verify payment status
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
          status: 'COMPLETED',
          demo: true,
        });
      }

      // Production code:
      // const client = new paypal.core.PayPalHttpClient(environment);
      // const getOrderRequest = new paypal.orders.OrdersGetRequest(transactionId);
      // const order = await client.execute(getOrderRequest);
      // return this.formatResponse(
      //   order.result.status === 'COMPLETED',
      //   transactionId,
      //   `Order status: ${order.result.status}`,
      //   { status: order.result.status }
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
   */
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

      // Production code:
      // Create refund via PayPal API
    } catch (error) {
      return this.formatResponse(false, null, 'Refund failed', {
        error: error.message,
        refunded: false,
      });
    }
  }

  /**
   * Get transaction details
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
            status: 'COMPLETED',
            amount: 49.99,
            currency: 'USD',
            created: new Date().toISOString(),
            demo: true,
          }
        );
      }

      // Production code:
      // Retrieve order details from PayPal API
    } catch (error) {
      return this.formatResponse(false, transactionId, 'Failed to retrieve details', {
        error: error.message,
      });
    }
  }
}

module.exports = PayPalPaymentGateway;

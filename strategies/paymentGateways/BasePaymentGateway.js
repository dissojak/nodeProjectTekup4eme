class BasePaymentGateway {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.gatewayName = this.constructor.name;
  }

  async processPayment(paymentData) {
    throw new Error('processPayment() must be implemented by subclass');
  }

  async verifyPayment(transactionId) {
    throw new Error('verifyPayment() must be implemented by subclass');
  }

  async refundPayment(transactionId, amount = null) {
    throw new Error('refundPayment() must be implemented by subclass');
  }

  async getTransactionDetails(transactionId) {
    throw new Error('getTransactionDetails() must be implemented by subclass');
  }

  isConfigured() {
    return this.apiKey !== null && this.apiKey !== '';
  }

  formatResponse(success, transactionId, message, additionalData = {}) {
    return {
      success,
      gateway: this.gatewayName,
      transactionId,
      timestamp: new Date().toISOString(),
      message,
      ...additionalData,
    };
  }
}

module.exports = BasePaymentGateway;

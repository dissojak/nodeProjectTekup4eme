/**
 * Follows SOLID principles
 */

class BasePaymentGateway {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.gatewayName = this.constructor.name;
  }

  /**
   * Process a payment through this gateway
   * Must be implemented by subclasses
   * @param {Object} paymentData - Contains amount, currency, customerEmail, invoiceId, etc.
   * @returns {Promise<Object>} - { success, transactionId, confirmation, error }
   */
  async processPayment(paymentData) {
    throw new Error('processPayment() must be implemented by subclass');
  }

  /**
   * Verify/validate a payment
   * @param {string} transactionId - Transaction ID to verify
   * @returns {Promise<Object>} - { verified, status, details }
   */
  async verifyPayment(transactionId) {
    throw new Error('verifyPayment() must be implemented by subclass');
  }

  /**
   * Refund a payment
   * @param {string} transactionId - Transaction ID to refund
   * @param {number} amount - Amount to refund (optional, full refund if not specified)
   * @returns {Promise<Object>} - { success, refundId, status }
   */
  async refundPayment(transactionId, amount = null) {
    throw new Error('refundPayment() must be implemented by subclass');
  }

  /**
   * Get transaction details
   * @param {string} transactionId
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransactionDetails(transactionId) {
    throw new Error('getTransactionDetails() must be implemented by subclass');
  }

  /**
   * Validate gateway credentials
   * @returns {boolean}
   */
  isConfigured() {
    return this.apiKey !== null && this.apiKey !== '';
  }

  /**
   * Format response in standard format
   * @param {boolean} success
   * @param {string} transactionId
   * @param {string} message
   * @param {Object} additionalData
   * @returns {Object}
   */
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

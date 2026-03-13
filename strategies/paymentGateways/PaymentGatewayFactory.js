/**
 * PaymentGatewayFactory - Factory pattern for payment gateway instantiation
 * Demonstrates Factory Pattern + Dependency Inversion Principle
 * 
 * Benefits:
 * - Single place to manage gateway instances
 * - Easy to add new gateways without modifying existing code
 * - Supports lazy loading and caching
 */

const StripePaymentGateway = require('./StripePaymentGateway');
const PayPalPaymentGateway = require('./PayPalPaymentGateway');

class PaymentGatewayFactory {
  constructor() {
    this.gateways = new Map();
    this.registerGateway('stripe', StripePaymentGateway);
    this.registerGateway('paypal', PayPalPaymentGateway);
    // As more gateways are needed, simply register them here
    // this.registerGateway('square', SquarePaymentGateway);
    // this.registerGateway('2checkout', TwoCheckoutPaymentGateway);
    // this.registerGateway('d17', D17PaymentGateway);
  }

  /**
   * Register a new payment gateway
   * Allows adding new gateways without modifying existing code
   * @param {string} name - Gateway identifier (e.g., 'stripe', 'paypal')
   * @param {Class} GatewayClass - Gateway class extending BasePaymentGateway
   */
  registerGateway(name, GatewayClass) {
    const lowerName = name.toLowerCase();
    if (!GatewayClass.prototype instanceof require('./BasePaymentGateway')) {
      // Basic check if it follows the interface
      if (typeof GatewayClass !== 'function') {
        throw new Error(`Gateway ${name} must be a class extending BasePaymentGateway`);
      }
    }
    this.gateways.set(lowerName, { class: GatewayClass, instance: null });
  }

  /**
   * Get or create a gateway instance
   * @param {string} gatewayName - Gateway identifier
   * @returns {BasePaymentGateway} - Gateway instance
   * @throws {Error} - If gateway not found
   */
  getGateway(gatewayName) {
    const lowerName = gatewayName.toLowerCase();
    
    if (!this.gateways.has(lowerName)) {
      throw new Error(
        `Payment gateway '${gatewayName}' not found. Available: ${Array.from(this.gateways.keys()).join(', ')}`
      );
    }

    const gatewayConfig = this.gateways.get(lowerName);
    
    // Lazy load: create instance only when first requested
    if (!gatewayConfig.instance) {
      gatewayConfig.instance = new gatewayConfig.class();
    }

    return gatewayConfig.instance;
  }

  /**
   * Get list of available gateways
   * @returns {Array<string>}
   */
  getAvailableGateways() {
    return Array.from(this.gateways.keys());
  }

  /**
   * Check if a gateway is available
   * @param {string} gatewayName
   * @returns {boolean}
   */
  hasGateway(gatewayName) {
    return this.gateways.has(gatewayName.toLowerCase());
  }

  /**
   * Get gateway configuration status (for debugging)
   * @returns {Object}
   */
  getStatus() {
    const status = {};
    this.gateways.forEach((config, name) => {
      const instance = config.instance || new config.class();
      status[name] = {
        configured: instance.isConfigured(),
        gateway: instance.gatewayName,
      };
    });
    return status;
  }
}

// Create and export singleton instance
const factoryInstance = new PaymentGatewayFactory();

module.exports = PaymentGatewayFactory;
module.exports.getFactory = () => factoryInstance;

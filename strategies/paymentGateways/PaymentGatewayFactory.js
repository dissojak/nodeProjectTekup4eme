/**
 * PaymentGatewayFactory - Manages payment gateway registration and instantiation
 * Uses Singleton pattern with lazy loading
 */

const StripePaymentGateway = require('./StripePaymentGateway');
const PayPalPaymentGateway = require('./PayPalPaymentGateway');

class PaymentGatewayFactory {
  constructor() {
    this.gateways = new Map();
    this.registerGateway('stripe', StripePaymentGateway);
    this.registerGateway('paypal', PayPalPaymentGateway);
  }

  registerGateway(name, GatewayClass) {
    const lowerName = name.toLowerCase();
    if (typeof GatewayClass !== 'function') {
      throw new Error(`Gateway ${name} must be a class extending BasePaymentGateway`);
    }
    this.gateways.set(lowerName, { class: GatewayClass, instance: null });
  }

  getGateway(gatewayName) {
    const lowerName = gatewayName.toLowerCase();
    
    if (!this.gateways.has(lowerName)) {
      throw new Error(
        `Payment gateway '${gatewayName}' not found. Available: ${Array.from(this.gateways.keys()).join(', ')}`
      );
    }

    const gatewayConfig = this.gateways.get(lowerName);
    
    if (!gatewayConfig.instance) {
      gatewayConfig.instance = new gatewayConfig.class();
    }

    return gatewayConfig.instance;
  }

  getAvailableGateways() {
    return Array.from(this.gateways.keys());
  }

  hasGateway(gatewayName) {
    return this.gateways.has(gatewayName.toLowerCase());
  }

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

/**
 * Payment Gateways Module
 * Exports all payment gateway classes and factory
 */

const BasePaymentGateway = require('./BasePaymentGateway');
const StripePaymentGateway = require('./StripePaymentGateway');
const PayPalPaymentGateway = require('./PayPalPaymentGateway');
const PaymentGatewayFactory = require('./PaymentGatewayFactory');

module.exports = {
  BasePaymentGateway,
  StripePaymentGateway,
  PayPalPaymentGateway,
  PaymentGatewayFactory,
  getFactory: PaymentGatewayFactory.getFactory,
};

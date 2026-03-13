# Payment Gateway System - SOLID Principles Implementation

## Overview

The payment gateway system demonstrates SOLID principles while providing a flexible, extensible architecture for integrating multiple online payment providers (Stripe, PayPal, etc.).

## SOLID Principles Applied

### 1. **Single Responsibility Principle (SRP)**
Each class has one reason to change:

```
BasePaymentGateway          → Define payment gateway interface
StripePaymentGateway        → Handle Stripe-specific logic
PayPalPaymentGateway        → Handle PayPal-specific logic
PaymentGatewayFactory       → Manage gateway instantiation
paymentGatewayController    → Handle HTTP requests
```

❌ **Bad**: One class handling Stripe, PayPal, AND HTTP requests
✅ **Good**: Each gateway handles only its own payment processing logic

### 2. **Open/Closed Principle (OCP)**
System is open for extension, closed for modification.

```javascript
// ✅ To add a new gateway (e.g., Square), just create new class:
class SquarePaymentGateway extends BasePaymentGateway {
  async processPayment(paymentData) { /* ... */ }
}

// Register it in factory:
factory.registerGateway('square', SquarePaymentGateway);

// No changes needed to existing code!
```

❌ **Bad**: Adding Stripe support requires modifying existing controllers/routes
✅ **Good**: Add new gateway without touching existing code

### 3. **Liskov Substitution Principle (LSP)**
All payment gateways are interchangeable.

```javascript
// This works with ANY gateway (Stripe, PayPal, etc.) without knowing which one
async processPayment(gatewayName, paymentData) {
  const gateway = factory.getGateway(gatewayName);
  return await gateway.processPayment(paymentData);
}
```

❌ **Bad**: Controller code that handles Stripe differently than PayPal
✅ **Good**: Same code works with all gateways through common interface

### 4. **Interface Segregation Principle (ISP)**
Clients depend only on methods they need.

```javascript
// BasePaymentGateway
class BasePaymentGateway {
  async processPayment(paymentData) { }      // Required
  async verifyPayment(transactionId) { }     // Required
  async refundPayment(transactionId) { }     // Optional but recommended
  async getTransactionDetails(txnId) { }     // Optional
}
```

Each gateway implements what it needs; controller only calls what's available.

❌ **Bad**: Force all gateways to implement WebhookHandler, even if they don't need it
✅ **Good**: Gateways implement core methods, optional methods are optional

### 5. **Dependency Inversion Principle (DIP)**
High-level modules depend on abstractions, not concrete implementations.

```javascript
// ✅ Controller depends on BasePaymentGateway (abstraction)
const gateway = factory.getGateway(gatewayName); // Abstract, not concrete
await gateway.processPayment(data);

// NOT like this:
const stripe = new StripePaymentGateway();  // ❌ Concrete dependency
const paypal = new PayPalPaymentGateway();  // ❌ Concrete dependency
```

---

## Architecture

```
routes/paymentGateway.js
    ↓
controllers/paymentGatewayController.js
    ↓
strategies/paymentGateways/index.js
    ├── BasePaymentGateway (Abstract)
    ├── StripePaymentGateway (Concrete)
    ├── PayPalPaymentGateway (Concrete)
    └── PaymentGatewayFactory (Factory Pattern)
```

## How to Add a New Payment Gateway

### Step 1: Create Gateway Class

```javascript
// strategies/paymentGateways/SquarePaymentGateway.js

const BasePaymentGateway = require('./BasePaymentGateway');

class SquarePaymentGateway extends BasePaymentGateway {
  constructor(apiKey = process.env.SQUARE_API_KEY) {
    super(apiKey);
    this.gatewayName = 'Square';
  }

  async processPayment(paymentData) {
    const { amount, currency, customerEmail } = paymentData;
    
    // Call Square API
    // return formatted response
    
    return this.formatResponse(true, txnId, 'Payment successful');
  }

  async verifyPayment(transactionId) {
    // Verify with Square API
  }

  async refundPayment(transactionId, amount) {
    // Refund logic
  }

  async getTransactionDetails(transactionId) {
    // Get details from Square
  }
}

module.exports = SquarePaymentGateway;
```

### Step 2: Register in Factory

```javascript
// strategies/paymentGateways/PaymentGatewayFactory.js

const SquarePaymentGateway = require('./SquarePaymentGateway');

class PaymentGatewayFactory {
  constructor() {
    this.registerGateway('stripe', StripePaymentGateway);
    this.registerGateway('paypal', PayPalPaymentGateway);
    this.registerGateway('square', SquarePaymentGateway);  // ← Add here
  }
}
```

### Step 3: Update Model (if needed)

```javascript
// models/Payment.js

paymentMethod: {
  enum: ['cash', 'check', 'transfer', 'stripe', 'paypal', 'square'],  // Add here
  // ...
}
```

That's it! The new gateway is now available system-wide.

---

## Usage Examples

### Initiate a Payment

```bash
POST /api/payments/gateway/initiate
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "invoiceId": "507f1f77bcf86cd799439011",
  "gatewayName": "stripe",
  "amount": 99.99,
  "customerEmail": "customer@example.com"
}
```

Response:
```json
{
  "success": true,
  "payment": {
    "_id": "507f1f77bcf86cd799439012",
    "invoice": "507f1f77bcf86cd799439011",
    "amount": 99.99,
    "transactionId": "ch_demo_1234567890_abcdef123",
    "transactionStatus": "pending"
  },
  "gatewayResponse": {
    "success": true,
    "gateway": "Stripe",
    "transactionId": "ch_demo_1234567890_abcdef123"
  }
}
```

### Confirm a Payment

```bash
POST /api/payments/gateway/confirm
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "paymentId": "507f1f77bcf86cd799439012",
  "transactionId": "ch_demo_1234567890_abcdef123"
}
```

### Refund a Payment

```bash
POST /api/payments/gateway/refund
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "paymentId": "507f1f77bcf86cd799439012",
  "amount": 99.99
}
```

### Get Available Gateways

```bash
GET /api/payments/gateways
```

Response:
```json
{
  "available": ["stripe", "paypal"],
  "status": {
    "stripe": { "configured": true, "gateway": "Stripe" },
    "paypal": { "configured": false, "gateway": "PayPal" }
  },
  "manualMethods": ["cash", "check", "transfer"]
}
```

---

## Configuration

Add these to your `.env` file:

```env
# Stripe
STRIPE_API_KEY=sk_test_your_stripe_key_here

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Square (when added)
SQUARE_API_KEY=your_square_api_key
```

---

## Demo Mode

All gateways include a **demo mode** that simulates API responses without requiring real API credentials. Set the API key to null/empty to enable demo mode:

```javascript
// Uses demo mode if STRIPE_API_KEY is not set
const gateway = new StripePaymentGateway();
const response = await gateway.processPayment(paymentData);
// Returns demo transaction data
```

---

## Design Patterns Used

1. **Factory Pattern** - `PaymentGatewayFactory` creates gateway instances
2. **Strategy Pattern** - Each gateway is a different strategy for payment processing
3. **Template Method Pattern** - `BasePaymentGateway` defines template, subclasses implement
4. **Singleton Pattern** - Factory instance is cached
5. **Dependency Injection** - Controllers receive gateways through factory

---

## Testing

```javascript
// Test with demo mode (no API keys needed)
const factory = new PaymentGatewayFactory();
const stripe = factory.getGateway('stripe');

// Works even without STRIPE_API_KEY
const result = await stripe.processPayment({
  amount: 99.99,
  currency: 'usd',
  customerEmail: 'test@example.com',
  description: 'Test payment',
});
```

---

## Summary

This architecture ensures:
✅ Easy to add new gateways (Stripe, PayPal, Square, 2Checkout, D17, etc.)
✅ No changes to existing code when adding new gateways
✅ Clean separation of concerns
✅ Testable in isolation
✅ Follows SOLID principles
✅ Scalable and maintainable

// Strategy pattern - each payment method has its own processing logic
// In a real app, these could connect to different external services

const paymentStrategies = {
  cash: {
    process: (paymentData) => {
      // Cash payment - immediate processing
      return {
        ...paymentData,
        processedAt: new Date(),
        confirmation: `CASH-${Date.now()}`,
      };
    },
  },

  check: {
    process: (paymentData) => {
      // Check payment - may need clearing time
      return {
        ...paymentData,
        processedAt: new Date(),
        confirmation: `CHK-${Date.now()}`,
        note: paymentData.note
          ? `${paymentData.note} (Check payment)`
          : 'Check payment - allow clearing time',
      };
    },
  },

  transfer: {
    process: (paymentData) => {
      // Bank transfer - reference number tracking
      return {
        ...paymentData,
        processedAt: new Date(),
        confirmation: `TRF-${Date.now()}`,
      };
    },
  },
};

const getPaymentStrategy = (method) => {
  const strategy = paymentStrategies[method];
  if (!strategy) {
    throw new Error(`Unknown payment method: ${method}`);
  }
  return strategy;
};

module.exports = { getPaymentStrategy };

// External services API keys
module.exports = {
  sendGrid: process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_KEY',
  twilio: process.env.TWILIO_API_KEY || 'YOUR_TWILIO_KEY',
  paymentGateway: process.env.PAYMENT_API_KEY || 'YOUR_PAYMENT_KEY',
};
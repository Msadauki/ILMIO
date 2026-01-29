module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'supersecretkey', // replace in prod
  tokenExpiry: '1d',  // JWT expiry
};
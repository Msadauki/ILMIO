const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Optional: token or message encryption placeholder
function encryptData(data) {
  // Add encryption logic here (AES, RSA, etc.)
  return data;
}

function decryptData(data) {
  // Add decryption logic here
  return data;
}

module.exports = { hashPassword, comparePassword, encryptData, decryptData };
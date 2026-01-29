const { createWallet, updateBalance, getWallet } = require('../models/walletModel');
const { logUserActivity } = require('./activityService');

async function initializeWallet(userId) {
  return await createWallet(userId);
}

async function addFunds(userId, amount) {
  const wallet = await updateBalance(userId, amount);
  await logUserActivity(null, userId, 'add_funds', { amount });
  return wallet;
}

async function deductFunds(userId, amount) {
  const wallet = await updateBalance(userId, -amount);
  await logUserActivity(null, userId, 'deduct_funds', { amount });
  return wallet;
}

async function getUserWallet(userId) {
  return await getWallet(userId);
}

module.exports = { initializeWallet, addFunds, deductFunds, getUserWallet };
const { logAdminActivity } = require('./activityService');
const { logAdminAction, getAdminActions } = require('../models/adminActionModel');

async function banUser(adminId, userId, reason) {
  const action = await logAdminAction({ adminId, userId, action: 'ban', reason });
  await logAdminActivity(adminId, userId, 'ban_user', { reason });
  return action;
}

async function warnUser(adminId, userId, reason) {
  const action = await logAdminAction({ adminId, userId, action: 'warn', reason });
  await logAdminActivity(adminId, userId, 'warn_user', { reason });
  return action;
}

async function getUserAdminHistory(userId) {
  return await getAdminActions(userId);
}

module.exports = { banUser, warnUser, getUserAdminHistory };
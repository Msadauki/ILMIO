const { logEvent, getEventsBySession } = require('../models/sessionEventModel');
const { logEvent: logAdmin } = require('../models/adminActionModel');

async function logUserActivity(sessionId, userId, action, meta = {}) {
  return await logEvent(sessionId, userId, action, meta);
}

async function logAdminActivity(adminId, userId, action, reason) {
  return await logAdmin({ adminId, userId, action, reason });
}

async function getSessionActivities(sessionId) {
  return await getEventsBySession(sessionId);
}

module.exports = { logUserActivity, logAdminActivity, getSessionActivities };
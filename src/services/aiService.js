const { getPersonalizedLearning, createAIClone } = require('../utils/aiHelpers');
const { logUserActivity } = require('./activityService');

async function recommendLearning(user) {
  const recommendation = getPersonalizedLearning(user);
  await logUserActivity(null, user.id, 'ai_recommendation', { recommendation });
  return recommendation;
}

async function createClone(user) {
  const clone = createAIClone(user);
  await logUserActivity(null, user.id, 'create_clone', { cloneId: clone.cloneId });
  return clone;
}

module.exports = { recommendLearning, createClone };
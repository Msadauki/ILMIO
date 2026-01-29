const { isFeatureEnabled } = require('./featureFlags');

function canAccess(user, featureName) {
  if (!user) return false;
  if (user.role === 'admin') return true; // Admin has full access
  if (!isFeatureEnabled(featureName)) return false;
  if (featureName === 'premiumFeatures' && !user.is_premium) return false;
  return true;
}

function canPerformAction(user, action) {
  // Example actions: 'create_class', 'start_exam', 'send_message'
  const rolePermissions = {
    student: ['join_class', 'take_exam', 'send_message'],
    teacher: ['create_class', 'start_exam', 'grade_exam', 'send_message'],
    admin: ['all'],
  };
  const perms = rolePermissions[user.role] || [];
  return perms.includes(action) || perms.includes('all');
}

module.exports = { canAccess, canPerformAction };
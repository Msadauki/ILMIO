const { disableCalculator } = require('./calculatorRules');

function applyExamRules(exam, user) {
  const rules = {
    allowCopyPaste: false,
    calculatorAllowed: exam.allowCalculator || false,
    maxTime: exam.duration || 60, // minutes
  };

  if (!rules.calculatorAllowed) disableCalculator(exam.id, user.id);

  return rules;
}

function detectSuspiciousActivity(userActions) {
  // Example: copy/paste, rapid answer changes
  const alerts = [];
  if (userActions.copyPasteDetected) alerts.push('Copy/Paste detected');
  if (userActions.fastAnswerSwitch) alerts.push('Rapid switching detected');
  return alerts;
}

module.exports = { applyExamRules, detectSuspiciousActivity };
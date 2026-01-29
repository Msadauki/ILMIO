const sessionState = {}; // example in-memory state, replace with DB for production

function enableCalculator(sessionId, userId) {
  if (!sessionState[sessionId]) sessionState[sessionId] = {};
  sessionState[sessionId][userId] = { calculatorEnabled: true };
}

function disableCalculator(sessionId, userId) {
  if (!sessionState[sessionId]) sessionState[sessionId] = {};
  sessionState[sessionId][userId] = { calculatorEnabled: false };
}

function isCalculatorEnabled(sessionId, userId) {
  return sessionState[sessionId]?.[userId]?.calculatorEnabled || false;
}

module.exports = { enableCalculator, disableCalculator, isCalculatorEnabled };
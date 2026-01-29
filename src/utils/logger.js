const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/activity.log');

function logEvent(event) {
  const logEntry = `${new Date().toISOString()} | ${event}\n`;
  fs.appendFileSync(logFile, logEntry, 'utf8');
}

module.exports = { logEvent };
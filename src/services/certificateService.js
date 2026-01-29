const { createCertificate, getCertificates } = require('../models/certificateModel');
const { logUserActivity } = require('./activityService');

async function awardCertificate(userId, course, grade) {
  const cert = await createCertificate({ userId, course, grade });
  await logUserActivity(null, userId, 'award_certificate', { certId: cert.id });
  return cert;
}

async function getUserCertificates(userId) {
  return await getCertificates(userId);
}

module.exports = { awardCertificate, getUserCertificates };
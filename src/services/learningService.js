const { createSession, getSessionById } = require('../models/sessionModel');
const { createExam, getExamById } = require('../models/examModel');
const { applyExamRules } = require('../rules/examRules');
const { logUserActivity } = require('./activityService');

async function createClass(title, teacherId, maxParticipants) {
  const session = await createSession({ title, teacherId, maxParticipants });
  await logUserActivity(session.id, teacherId, 'create_class');
  return session;
}

async function scheduleExam(sessionId, title, duration, allowCalculator = false) {
  const exam = await createExam({ title, sessionId, duration, allowCalculator });
  await logUserActivity(sessionId, null, 'schedule_exam', { examId: exam.id });
  return exam;
}

async function startExam(examId, user) {
  const exam = await getExamById(examId);
  const rules = applyExamRules(exam, user);
  await logUserActivity(exam.session_id, user.id, 'start_exam', { examId });
  return { exam, rules };
}

module.exports = { createClass, scheduleExam, startExam };
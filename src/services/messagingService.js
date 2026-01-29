const { sendMessage, getMessages } = require('../models/messageModel');
const { encryptData, decryptData } = require('../utils/encryption');

async function sendUserMessage(senderId, receiverId, message) {
  const encrypted = encryptData(message);
  return await sendMessage({ senderId, receiverId, message: encrypted });
}

async function getUserConversation(user1, user2) {
  const messages = await getMessages(user1, user2);
  return messages.map(msg => ({ ...msg, message: decryptData(msg.message) }));
}

module.exports = { sendUserMessage, getUserConversation };
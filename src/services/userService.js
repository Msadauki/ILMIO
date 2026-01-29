const { createUser, getUserByEmail, getUserById } = require('../models/userModel');
const { createProfile, getProfile, updateProfile } = require('../models/profileModel');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { isEmail, isStrongPassword } = require('../utils/validator');

async function registerUser({ username, email, password, role }) {
  if (!isEmail(email)) throw new Error('Invalid email');
  if (!isStrongPassword(password)) throw new Error('Password not strong enough');

  const user = await createUser({ username, email, password, role });
  await createProfile(user.id);
  return user;
}

async function loginUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error('Invalid password');

  return user; // JWT creation will be in API layer
}

async function getUserProfile(userId) {
  const profile = await getProfile(userId);
  return profile;
}

async function updateUserProfile(userId, data) {
  return await updateProfile(userId, data);
}

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
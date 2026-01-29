function isEmail(email) {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
}

function isStrongPassword(password) {
  // At least 8 chars, 1 uppercase, 1 number
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

function isValidRole(role) {
  const roles = ['student', 'teacher', 'admin'];
  return roles.includes(role);
}

module.exports = { isEmail, isStrongPassword, isValidRole };
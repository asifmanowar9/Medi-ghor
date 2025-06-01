/**
 * Validates if a password meets the required criteria:
 * - At least one capital letter
 * - At least one small letter
 * - At least one number
 * - At least one special character
 *
 * @param {string} password - The password to validate
 * @returns {Object} - Object with isValid boolean and message string
 */
export const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  // eslint-disable-next-line no-useless-escape
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  let message = '';
  if (!isValid) {
    message = 'Password must contain at least:';
    if (!hasUpperCase) message += ' one uppercase letter,';
    if (!hasLowerCase) message += ' one lowercase letter,';
    if (!hasNumber) message += ' one number,';
    if (!hasSpecialChar) message += ' one special character,';
    message = message.slice(0, -1) + '.'; // Remove trailing comma and add period
  }

  return { isValid, message };
};

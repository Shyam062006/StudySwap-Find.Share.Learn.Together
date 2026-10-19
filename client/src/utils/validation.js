/**
 * Validate email format
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

/**
 * Validate that a field is not empty
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

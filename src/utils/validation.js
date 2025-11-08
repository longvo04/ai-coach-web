/**
 * Validation utilities for form inputs
 */

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 4) {
    return { isValid: false, error: 'Username must be at least 4 characters' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be at most 20 characters' };
  }

  // Only letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {boolean} strict - If true, require stronger password (uppercase, lowercase, number, special char)
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validatePassword = (password, strict = false) => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must be at most 128 characters' };
  }

  if (strict) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }

    if (!hasLowerCase) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }

    if (!hasNumber) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }

    if (!hasSpecialChar) {
      return { isValid: false, error: 'Password must contain at least one special character' };
    }
  }

  return { isValid: true, error: '' };
};

/**
 * Validate date of birth
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateDateOfBirth = (dob) => {
  if (!dob || dob.trim() === '') {
    return { isValid: false, error: 'Date of birth is required' };
  }

  const dobDate = new Date(dob);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only

  // Check if date is valid
  if (isNaN(dobDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Check if date is in the future
  if (dobDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  // Calculate age
  const age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  const dayDiff = today.getDate() - dobDate.getDate();

  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  // Check if age is reasonable (between 13 and 120)
  if (actualAge < 13) {
    return { isValid: false, error: 'You must be at least 13 years old' };
  }

  if (actualAge > 120) {
    return { isValid: false, error: 'Please enter a valid date of birth' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: '' };
};

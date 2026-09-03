/**
 * Password and username validation utilities.
 * Used by both auth controller and registration/reset flows.
 */

const RESERVED_USERNAMES = [
  'admin', 'api', 'feed', 'settings', 'login', 'register', 'support',
  'help', 'root', 'system', 'null', 'undefined', 'about', 'home',
  'dashboard', 'profile', 'projects', 'applications', 'chat',
  'notifications', 'onboarding', 'auth', 'user', 'users',
];

/**
 * Validate password against strong password policy.
 * Min 10 chars, uppercase, lowercase, digit, special char.
 * Returns { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 10) {
    return { valid: false, message: 'Password must be at least 10 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: 'Password is strong' };
};

/**
 * Validate username format.
 * 3-20 chars, letters/numbers/underscore/dot.
 * No reserved words.
 * Returns { valid: boolean, message: string }
 */
export const validateUsername = (username) => {
  if (!username || username.trim().length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, message: 'Username must be at most 20 characters' };
  }
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, underscores, and dots' };
  }
  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return { valid: false, message: 'This username is reserved. Please choose a different username' };
  }
  return { valid: true, message: 'Username is valid' };
};

/**
 * Calculate password strength score (0-4).
 * Used for frontend strength meter computation on backend.
 */
export const getPasswordStrength = (password) => {
  let score = 0;
  if (!password) return { score: 0, label: 'None' };
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return { score, label: labels[score] };
};

export default { validatePassword, validateUsername, getPasswordStrength };

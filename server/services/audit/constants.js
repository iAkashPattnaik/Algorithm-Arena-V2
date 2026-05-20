const AUDIT_ACTIONS = Object.freeze({
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_REFRESH: 'auth.refresh',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_LOGOUT_ALL: 'auth.logout_all',
  CHALLENGE_CREATE: 'challenge.create',
  CHALLENGE_UPDATE: 'challenge.update',
  CHALLENGE_DELETE: 'challenge.delete',
  SUBMISSION_CREATE: 'submission.create',
  SUBMISSION_REVIEW: 'submission.review',
  SUBMISSION_DELETE: 'submission.delete',
});

const TARGET_TYPES = Object.freeze({
  AUTH: 'auth',
  USER: 'user',
  CHALLENGE: 'challenge',
  SUBMISSION: 'submission',
  SYSTEM: 'system',
});

module.exports = {
  AUDIT_ACTIONS,
  TARGET_TYPES,
};

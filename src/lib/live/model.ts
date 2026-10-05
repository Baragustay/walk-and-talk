// Shared by the token function and the client. Checked against ai.google.dev/gemini-api/docs/models (Oct 2026):
// gemini-3.8-live is the current stable native-audio Live model.
export const LIVE_MODEL = 'gemini-3.8-live'

// Ephemeral tokens are only supported on the v1alpha API.
export const LIVE_API_VERSION = 'v1alpha'

// Longest walk option is 30 min; leave room for the end-of-walk quiz.
export const TOKEN_LIFETIME_MINUTES = 45

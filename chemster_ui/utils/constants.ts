// Proxy endpoints to back-end API
export const API_ENDPOINT = 'api'
export const REST_API_ENDPOINT = `${API_ENDPOINT}/rest`
export const VIZ_API_ENDPOINT = `${API_ENDPOINT}/viz`
// Used for both workspace and set stores
export const REST_API_COLLECTIONS_ENDPOINT = `${REST_API_ENDPOINT}/collections`

// Proxy endpoint to CTX APIs
export const CTX_ENDPOINT = 'ctx'
// CTX doesn't expose an endpoint for prediction sources right now, so set them manually
export const CTX_PROPERTY_SOURCES = ['TEST', 'OPERA', 'ACD/Labs', 'EPISUITE']

// For force navigation:
// index -> login if not logged in
// login -> index if logged in
export const UI_LOGIN_ENDPOINT = '/login'
export const UI_INDEX_ENDPOINT = '/'

// Prefix for access/refresh tokens in authorization headers
export const AUTH_HEADER_PREFIX = 'Bearer '
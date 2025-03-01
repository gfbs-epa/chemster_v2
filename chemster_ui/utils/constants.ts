// Proxy endpoints to back-end API
export const API_ENDPOINT = 'api'
export const REST_API_ENDPOINT = `${API_ENDPOINT}/rest`
// Used for both workspace and list stores
export const REST_API_COLLECTIONS_ENDPOINT = `${REST_API_ENDPOINT}/collections`

// For force navigation:
// index -> login if not logged in
// login -> index if logged in
export const UI_LOGIN_ENDPOINT = '/login'
export const UI_INDEX_ENDPOINT = '/'

// Sources for property measurements from CTX APIs
export const PROPERTY_SOURCES = ['TEST', 'OPERA', 'ACD/Labs', 'EPISUITE']
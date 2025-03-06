import { defineStore } from 'pinia'
import type { Credentials, Tokens } from '~/utils/types'
import { AUTH_HEADER_PREFIX, API_ENDPOINT, UI_LOGIN_ENDPOINT } from '~/utils/constants'

const REGISTER = 'register'
const LOGIN = 'login'
const REFRESH = 'refresh'
const LOGOUT = 'logout'

export const useAuthStore = defineStore('auth',  () => {
  // Current value for the access token authorization header
  const accessToken = ref('')
  // Current value for the refresh token authorization header
  const refreshToken = ref('')
  // Name of the current user for display
  const currentUsername = ref('')

  // Getter to check if currently authenticated
  const authenticated = computed(() => !!accessToken.value)

  // Send authentication request with credentials to the register endpoint
  async function register(credentials: Credentials) {
    return postCredentials(REGISTER, credentials)
  }

  // Send authentication request with credentials to the login endpoint
  async function login(credentials: Credentials) {
    return postCredentials(LOGIN, credentials)
  }

  // Refresh access token using refresh token
  async function refresh() {
    return $fetch.raw<Tokens>(`${API_ENDPOINT}/${REFRESH}`, makeHeaders(refreshToken.value))
    .then((response) => accessToken.value = formatToken(response._data?.access_token))
    // If this fails, refresh token is also expired and user must log in again,
    // so reset the store and send them to the login page
    .catch(async () => exit())
  }

  // Revoke both access and refresh token in separate calls,
  // then clear the store and navigate to login
  async function logout() {
    return Promise.all(
      [accessToken.value, refreshToken.value].map(
        async (token) => $fetch.raw(`${API_ENDPOINT}/${LOGOUT}`, makeHeaders(token))
      )).finally(async () => exit()
    )
  }

  // Helper to make either register or login calls, since format is identical
  async function postCredentials(endpoint: string, credentials: Credentials) {
    return $fetch.raw<Tokens>(`${API_ENDPOINT}/${endpoint}`, { method: 'POST', body: credentials })
    .then((response) => {
      // Update the store with granted access and refresh tokens and current user identity
      accessToken.value = formatToken(response._data?.access_token)
      refreshToken.value = formatToken(response._data?.refresh_token)
      currentUsername.value = credentials.username
    })
    .catch(async () => exit())
  }

  // Helper to clear authentication store and return to login page on error or logout
  async function exit() {
    accessToken.value = ''
    refreshToken.value = ''
    currentUsername.value = ''
    return navigateTo(UI_LOGIN_ENDPOINT)
  }

  // Helper to add header prefix to token strings
  function formatToken(token: string | undefined) {
    return !!token ? AUTH_HEADER_PREFIX + token : ''
  }

  // Helper to build authorization headers using token
  function makeHeaders(token: string) {
    return { headers: { Authorization: token } }
  }

  return { 
    accessToken, 
    refreshToken, // refreshToken isn't accessed elsewhere, but must be exported to be persisted
    currentUsername, 
    authenticated, 
    register, 
    login, 
    refresh, 
    logout 
  }
},
// Persist auth state in cookies to avoid logout on every refresh
{ persist: { storage: piniaPluginPersistedstate.cookies() } })
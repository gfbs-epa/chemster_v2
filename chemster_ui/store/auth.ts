import { defineStore } from 'pinia'
import { useChemicalStore } from './chemicals'
import { useWorkspaceStore } from './workspaces'
import type { Credentials, Tokens } from '~/utils/types'
import { API_ENDPOINT, UI_LOGIN_ENDPOINT } from '~/utils/constants'

export const useAuthStore = defineStore('auth',  () => {
  const accessHeader = ref('')
  const refreshHeader = ref('')
  const currentUsername = ref('')

  // Getter to check if currently authenticated
  const authenticated = computed(() => !!accessHeader.value)

  async function register(credentials: Credentials) {
    await postCredentials(`${API_ENDPOINT}/register`, credentials)
  }

  async function login(credentials: Credentials) {
    await postCredentials(`${API_ENDPOINT}/login`, credentials)
  }

  // Refresh access token using refresh token
  async function refresh() {
    await $fetch.raw<Tokens>(`${API_ENDPOINT}/refresh`, { headers: { Authorization: refreshHeader.value } })
    .then((response) => {
      accessHeader.value = `Bearer ${response._data?.access_token}`
      return true
    })
    // If this fails, refresh token is also expired and user must log in again,
    // so reset the store and send them to the login page
    .catch(async () => reset())
  }

  async function logout() {
    // Revoke both access and refresh token in separate calls,
    // then clear the store and navigate to login
    await Promise.allSettled(
      [accessHeader.value, refreshHeader.value].map(async header => await $fetch.raw(`${API_ENDPOINT}/logout`, { headers: { Authorization: header } }))
    ).finally(async () => reset())
  }

  // Helper to make either register or login calls, since format is identical
  async function postCredentials(endpoint: string, credentials: Credentials) {
    await $fetch.raw<Tokens>(endpoint, { method: 'POST', body: credentials })
    .then((response) => {
      // Update the store with granted access and refresh tokens and current user identity
      accessHeader.value = `Bearer ${response._data?.access_token}`
      refreshHeader.value = `Bearer ${response._data?.refresh_token}`
      currentUsername.value = credentials.username
      return true
    })
    .catch(async () => reset())
  }

  // Helper to clear authentication store and return to login page on error or logout
  // Also resets other data stores to avoid leaking data between users
  async function reset() {
    accessHeader.value = ''
    refreshHeader.value = ''
    currentUsername.value = ''

    useWorkspaceStore().reset()
    useChemicalStore().reset()

    await navigateTo(UI_LOGIN_ENDPOINT)
    return false
  }

  // refreshHeader isn't used elsewhere, but must be exported to be persisted
  return { accessHeader, refreshHeader, currentUsername, authenticated, register, login, refresh, logout }
},
// Persist authorization state in cookies to avoid logout on every refresh
{ persist: { storage: piniaPluginPersistedstate.cookies() } })
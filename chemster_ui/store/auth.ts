import { defineStore } from 'pinia'
import { useChemicalsStore } from './chemicals'
import { useCollectionsStore } from './collections'
import type { Credentials, Tokens } from '~/utils/types'
import { API_ENDPOINT, UI_LOGIN_ENDPOINT } from '~/utils/constants'

export const useAuthStore = defineStore('auth',  () => {
  const accessHeader = ref('')
  const refreshHeader = ref('')
  const currentUsername = ref('')

  async function register(credentials: Credentials) {
    await postCredentials(`${API_ENDPOINT}/register`, credentials)
  }

  async function login(credentials: Credentials) {
    await postCredentials(`${API_ENDPOINT}/login`, credentials)
  }

  async function refresh() {
    const response = await $fetch.raw<Tokens>(`${API_ENDPOINT}/refresh`, { headers: { Authorization: refreshHeader.value } })
    if (response.status === 200) {
      // Save new generated access token
      accessHeader.value = `Bearer ${response._data?.access_token}`
      return true
    } else {
      // If this fails, refresh token is also expired and user has to log in again
      return reset()
    }
  }

  async function logout() {
    // Revoke both access and refresh token in separate calls
    [accessHeader.value, refreshHeader.value].forEach(async (header) => {
      await $fetch.raw(`${API_ENDPOINT}/logout`, { headers: { Authorization: header } })
    })
    // Clear store data and return to login page
    return reset()
  }

  // Helper to make either register or login calls, since format is identical
  async function postCredentials(endpoint: string, credentials: Credentials) {
    const response = await $fetch.raw<Tokens>(endpoint, { method: 'POST', body: credentials })
    // Returns 201 for successful user registration, 200 for successful login of existing user
    if (response.status === 201 || response.status === 200) {
      accessHeader.value = `Bearer ${response._data?.access_token}`
      refreshHeader.value = `Bearer ${response._data?.refresh_token}`
      currentUsername.value = credentials.username
      return true
    } else {
      // Reset and force another registration or login attempt
      return reset()
    }
  }

  // Helper to clear authentication store and return to login page on error or logout
  // Also resets other data stores to avoid leaking data between users
  function reset() {
    accessHeader.value = ''
    refreshHeader.value = ''
    currentUsername.value = ''

    useCollectionsStore().reset()
    useChemicalsStore().reset()

    navigateTo(UI_LOGIN_ENDPOINT)
    return false
  }

  // refreshHeader isn't used elsewhere, but must be exported to be persisted
  return { accessHeader, refreshHeader, currentUsername, register, login, refresh, logout }
},
// Persist authorization state in cookies to avoid logout on every refresh
{ persist: { storage: piniaPluginPersistedstate.cookies() } })
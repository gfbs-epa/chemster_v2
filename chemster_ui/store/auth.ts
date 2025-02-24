import { defineStore } from 'pinia'

type Credentials = { username: string, password: string }
type Tokens = { access_token: string, refresh_token: string }
type AccessToken = { access_token: string }

const registerEndpoint = 'api/register'
const loginEndpoint = 'api/login'
const refreshEndpoint = 'api/refresh'
const logoutEndpoint = 'api/logout'

export const useAuthStore = defineStore('auth',  () => {
    const currentUser = ref('')
    const accessHeader = ref('')
    const refreshHeader = ref('')
    const authenticated = ref(false)

    async function register(credentials: Credentials) {
        await fetchAuth(registerEndpoint, credentials)
    }

    async function login(credentials: Credentials) {
        await fetchAuth(loginEndpoint, credentials)
    }

    async function refresh() {
        const response = await $fetch.raw<AccessToken>(refreshEndpoint, { headers: { Authorization: refreshHeader.value } })
        if (response.status === 200) {
            // Save new generated access token
            accessHeader.value = `Bearer ${response._data?.access_token}`
        } else {
            // If this fails, refresh token is also expired and user has to log in again
            return clearAuth()
        }
    }

    async function logout() {
        // Revoke access token
        await $fetch.raw(logoutEndpoint, { headers: { Authorization: accessHeader.value } })
        // Revoke refresh token
        await $fetch.raw(logoutEndpoint, { headers: { Authorization: refreshHeader.value } })
        // Clear store data and return to login page
        return clearAuth()
    }

    // Helper to make either register or login calls, since format is identical
    async function fetchAuth(endpoint: string, credentials: Credentials) {
        const response = await $fetch.raw<Tokens>(endpoint, { method: 'POST', body: credentials })
        // Returns 201 for successful user registration, 200 for successful login of existing user
        if (response.status === 201 || response.status === 200) {
            authenticated.value = true
            currentUser.value = credentials.username
            accessHeader.value = `Bearer ${response._data?.access_token}`
            refreshHeader.value = `Bearer ${response._data?.refresh_token}`
        } else {
            return clearAuth()
        }
    }

    // Helper to clear authentication store and return to login page on error or logout
    function clearAuth() {
        authenticated.value = false
        accessHeader.value = ''
        refreshHeader.value = ''
        return navigateTo('/login')
    }

    return { authenticated, accessHeader, register, login, refresh, logout }
})
import { useAuthStore } from '~/store/auth'

// Custom fetch plugin to get data from back-end using JWT authentication
export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()
  const api = $fetch.create({
    onRequest({ options }) {
      // If authenticated, set auth header and prepare to retry once if token expired
      if (authStore.authenticated) {
        options.headers.set('Authorization', authStore.accessHeader)
        options.retry = 1
        options.retryStatusCodes = [401]
        options.retryDelay = 500 // Delay to ensure refresh runs first
      }
      // If not authenticated, request will proceed without auth header, receive 401, and will not be retried
    },
    async onResponseError({ response }) {
      // If authenticated but receive 401 anyways, refresh access token
      // Request will then be retried according to options above
      if (response.status === 401 && authStore.authenticated) {
        authStore.refresh()
      }
    }
  })

  return { provide: { api } }
})
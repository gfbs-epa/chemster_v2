import { useAuthStore } from '~/store/auth'

// Custom fetch plugin to get data from back-end 
// using JWT authentication with automatic token refresh
export default defineNuxtPlugin(() => {
  // Load user authentication data
  const authStore = useAuthStore()
  // Set up custom fetch parameters
  const api = $fetch.create({
    onRequest({ options }) {
      // If authenticated, set auth header and prepare to retry if token expired
      if (authStore.authenticated) {
        options.headers.set('Authorization', authStore.accessToken)
        options.retry = 1
        options.retryStatusCodes = [401]
        options.retryDelay = 500 // Delay to ensure refresh runs before retry
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
import { useAuthStore } from '~/store/auth'

// Custom authenticated fetch plugin for data fetching from back-end
export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()
  const authFetch = $fetch.create({
    onRequest({ options }) {
      // If authenticated, set auth header and prepare to retry after a delay if token is expired
      if (authStore.authenticated) {
        options.headers.set('Authorization', authStore.accessHeader)
        options.retry = 1
        options.retryStatusCodes = [401]
        options.retryDelay = 500
      }
      // If not authenticated, request will proceed without auth header, receive 401, and will not be retried
    },
    async onResponseError({ response }) {
      // If authenticated but receive 401 anyways, refresh auth token
      // Request will then be retried according to options above
      if (response.status === 401 && authStore.authenticated) {
        authStore.refresh()
      }
    }
  })

  return { provide: { authFetch } }
})
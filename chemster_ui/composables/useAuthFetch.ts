import type { UseFetchOptions } from 'nuxt/app'

// Composable to use custom authenticated fetch plugin like useFetch
export function useAuthFetch<T>(url: string | (() => string), options?: UseFetchOptions<T>) {
  return useFetch(url, { ...options, $fetch: useNuxtApp().$authFetch as typeof $fetch })
}
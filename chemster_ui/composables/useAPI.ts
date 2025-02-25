import type { UseFetchOptions } from 'nuxt/app'

// Composable to use custom $authFetch plugin like useFetch
export function useAPI<T>(url: string | (() => string), options?: UseFetchOptions<T>) {
  return useFetch(url, { ...options, $fetch: useNuxtApp().$api as typeof $fetch })
}
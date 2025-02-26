import type { UseFetchOptions } from 'nuxt/app'

// Composable to use custom $ctx plugin like useFetch
export function useCTX<T>(url: string | (() => string), options?: UseFetchOptions<T>) {
  return useFetch(url, { ...options, $fetch: useNuxtApp().$ctx as typeof $fetch })
}
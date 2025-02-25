// Custom fetch plugin to get data from CTX API
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const ctx = $fetch.create({
    onRequest({ options }) {
      options.baseURL = config.public.ctxApiUrl
      // Automatically assigns API key header from runtime config to all requests
      options.headers.set('x-api-key', config.public.ctxApiKey)
      options.headers.set('accept', 'application/json')
    }
  })
  return { provide: { ctx } }
})
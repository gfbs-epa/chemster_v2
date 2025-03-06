// Custom fetch plugin to get data from CTX API
export default defineNuxtPlugin(() => {
  // Set up custom fetch parameters
  const ctx = $fetch.create({
    onRequest({ options }) {
      // Automatically assign API key header from runtime config to all requests
      options.headers.set('x-api-key', useRuntimeConfig().public.ctxApiKey)
      options.headers.set('accept', 'application/json')
      // Ensure retries in case of server overload
      options.retry = 3
      options.retryStatusCodes = [500, 502, 503, 504]
      options.retryDelay = 200
    }
  })

  return { provide: { ctx } }
})
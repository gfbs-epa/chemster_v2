// Custom fetch plugin to get data from CTX API without exposing key client-side
export default defineNuxtPlugin((nuxtApp) => {
  const ctx = $fetch.create({
    onRequest({ options }) {
      // Automatically assigns API key header from runtime config to all requests
      options.headers.set('x-api-key', useRuntimeConfig().ctxApiKey)
    }
  })
  return { provide: { ctx } }
})
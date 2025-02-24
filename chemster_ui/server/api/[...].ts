import { joinURL } from 'ufo'

// Generic proxy for back-end API requests to avoid exposing any data client-side
export default defineEventHandler(async (request) => {
  return proxyRequest(request, joinURL(useRuntimeConfig().chemsterApiUrl, request.path))
})
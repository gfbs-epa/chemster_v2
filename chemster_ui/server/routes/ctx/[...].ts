import { joinURL } from 'ufo'

// Generic proxy for CTX API requests to fix CORS issues
export default defineEventHandler(async (request) => {
  return proxyRequest(request, joinURL(useRuntimeConfig().public.ctxApiUrl, request.path.replace('/ctx', '')))
})
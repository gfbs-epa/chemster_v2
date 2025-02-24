import { joinURL, withQuery } from 'ufo'

// Specific proxy for master collection query to avoid exposing master collection ID client-side
export default defineEventHandler(async (request) => {
  const config = useRuntimeConfig()
  const target = withQuery(joinURL(config.chemsterApiUrl, request.path.replace('/master', '')), { super_id: config.masterCollectionId })
  return proxyRequest(request, target)
})
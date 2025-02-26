import { defineStore } from 'pinia'
import { REST_API_ENDPOINT } from '~/utils/constants'
import type { APIChemical, CTXChemical } from '~/utils/types'

const API_CHEMICALS_ENDPOINT = `${REST_API_ENDPOINT}/chemicals`
const CTX_CHEMICALS_ENDPOINT = 'ctx/detail/search/by-dtxsid/?projection=ntatoolkit'

export const useChemicalsStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentChemicals = ref(Array<CTXChemical>())

  // Integrate back-end and CTX chemical data fetching
  async function fetchChemicals(collectionIds: number[], recursive: boolean) {
    await fetchChemicalsFromAPI(collectionIds, recursive)
      .then(async (apiChemicals) => {
        currentChemicals.value = await fetchChemicalsFromCTX(apiChemicals.map((c: APIChemical) => c.dtxsid))
      })
  }

  // Back-end chemical data fetching
  async function fetchChemicalsFromAPI(collectionIds: number[], recursive: boolean) {
    return await useNuxtApp().$api<Array<APIChemical>>(API_CHEMICALS_ENDPOINT, { query: { recursive: recursive, collection_id: collectionIds } })
  }

  // CTX chemical detail data fetching
  async function fetchChemicalsFromCTX(dtxsids: string[]) {
    return await useNuxtApp().$ctx<Array<CTXChemical>>(CTX_CHEMICALS_ENDPOINT, { method: 'POST', body: dtxsids })
  }

  // Helper to reset whole store when user logs out
  function reset() {
    currentChemicals.value = Array<CTXChemical>()
  }

  return { currentChemicals, fetchChemicals, reset }
})
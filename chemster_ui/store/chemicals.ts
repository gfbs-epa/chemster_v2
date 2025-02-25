import { defineStore } from 'pinia'
import { useAPI } from '~/composables/useAPI'
import { useCTX } from '~/composables/useCTX'
import { REST_API_ENDPOINT } from '~/utils/constants'
import type { APIChemical, CTXChemical } from '~/utils/types'

const API_CHEMICALS_ENDPOINT = `${REST_API_ENDPOINT}/chemicals`
const CTX_CHEMICALS_ENDPOINT = '/detail/search/by-dtxsid/?projection=ntatoolkit'

export const useChemicalsStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentChemicals = ref(Array<CTXChemical>())

  // Integrate back-end and CTX chemical data fetching
  async function fetchChemicals(collectionIds: number[], recursive: boolean) {
    const apiChemicals = await fetchChemicalsFromAPI(collectionIds, recursive)
    if (apiChemicals != null) {
      currentChemicals.value = await fetchChemicalsFromCTX(apiChemicals.map((c: APIChemical) => c.dtxsid)) as Array<CTXChemical>
    }
  }

  // Back-end chemical data fetching
  async function fetchChemicalsFromAPI(collectionIds: number[], recursive: boolean) {
    const { data } = await useAPI<Array<APIChemical>>(API_CHEMICALS_ENDPOINT, { query: { recursive: recursive, collection_id: collectionIds } })
    return data.value
  }

  // CTX chemical detail data fetching
  async function fetchChemicalsFromCTX(dtxsids: string[]) {
    const { data } = useCTX<Array<CTXChemical>>(CTX_CHEMICALS_ENDPOINT, { method: 'POST', body: dtxsids })
    return data.value
  }

  // Helper to reset whole store when user logs out
  function reset() {
    currentChemicals.value = Array<CTXChemical>()
  }

  return { currentChemicals, fetchChemicals, reset }
})
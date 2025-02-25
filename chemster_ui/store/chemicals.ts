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

  // Fetch chemicals from back-end
  async function fetchChemicals(collectionIds: number[], recursive: boolean) {
    const { data: apiData } = await useAPI<Array<APIChemical>>(API_CHEMICALS_ENDPOINT, { query: { recursive: recursive, collection_id: collectionIds } })
    if (!!apiData) {
      const { data: ctxData } = useCTX<Array<CTXChemical>>(
        CTX_CHEMICALS_ENDPOINT,
        { method: 'POST', body: apiData.value.map((item: APIChemical) => item.dtxsid) }
      )
      currentChemicals.value = ctxData.value as Array<CTXChemical>
    }
    
  }

  // Helper to reset whole store when user logs out
  function reset() {
    currentChemicals.value = Array<CTXChemical>()
  }

  return { currentChemicals, fetchChemicals, reset }
})
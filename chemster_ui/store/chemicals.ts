import { defineStore } from 'pinia'
import { REST_API_ENDPOINT } from '~/utils/constants'
import type { Chemical } from '~/utils/types'

const API_CHEMICALS_ENDPOINT = `${REST_API_ENDPOINT}/chemicals`

export const useChemicalStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentDtxsids = ref([]) as Ref<string[]>

  // Getter to check if any chemicals currently loaded
  const chemicalsLoaded = computed(() => currentDtxsids.value.length > 0)

  // Fetch DTXSIDs from back-end API based on selected collections
  async function fetchDtxsids(workspaceId: number, listIds: number[]) {
    // Fetch specific lists if selected, otherwise entire workspace
    const collectionIds = listIds.length > 0 ? listIds : [workspaceId]
    // Run the API query, then map from chemical objects to DTXSID strings
    return useNuxtApp().$api<Array<Chemical>>(
      API_CHEMICALS_ENDPOINT, 
      { query: { collection_id: collectionIds, recursive: true } }
    )
    .then((chemicals) => currentDtxsids.value = chemicals.map((c) => c.dtxsid))
  }

  // Upload a set of chemicals to the back-end and associate them with a collection
  async function createChemicalsInCollection(dtxsids: string[], collection_id: number) {
    return useNuxtApp().$api<Chemical[]>(API_CHEMICALS_ENDPOINT, 
      {
        method: 'POST', 
        query: { batch: true, collection_id: collection_id },
        body: dtxsids.map((d) => { return { dtxsid: d } })
      }
    )
  }

  function reset() {
    currentDtxsids.value = []
  }

  return { 
    currentDtxsids, 
    chemicalsLoaded, 
    fetchDtxsids, 
    createChemicalsInCollection, 
    reset 
  }
})
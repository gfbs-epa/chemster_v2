import { defineStore, mapActions } from 'pinia'
import { REST_API_ENDPOINT } from '~/utils/constants'
import type { Chemical, ChemicalCollections } from '~/utils/types'

const API_COLLECTION_CHEMICALS_ENDPOINT = `${REST_API_ENDPOINT}/chemical-collections`

export const useChemicalStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentChemicals = ref([]) as Ref<ChemicalCollections[]>

  // Getter to map chemicals to DTXSIDs for display queries
  const currentDtxsids = computed(() => currentChemicals.value.map((chemical) => chemical.chemical_dtxsid))
  // Map chemicals to set membership
  const chemicalSetsMap = computed(() => new Map(currentChemicals.value.map((c) => [c.chemical_dtxsid, c.collection_ids.split(",").map((id) => +id).sort((a, b) => a - b)])))
  // Getter to check if any chemicals currently loaded
  const chemicalsLoaded = computed(() => currentChemicals.value.length > 0)

  // Fetch chemicals from back-end API based on selected collections
  async function fetchChemicals(listIds: number[]) {
    // Run the API query, then map from chemical objects to DTXSID strings
    return useNuxtApp().$api<Array<ChemicalCollections>>(
      API_COLLECTION_CHEMICALS_ENDPOINT, 
      { query: { collection_id: listIds, recursive: true } }
    )
    .then((chemicals) => currentChemicals.value = chemicals)
  }

  // Upload a set of chemicals to the back-end and associate them with a collection
  async function createChemicalsInCollection(dtxsids: string[], collection_id: number) {
    return useNuxtApp().$api<Chemical[]>(API_COLLECTION_CHEMICALS_ENDPOINT, 
      {
        method: 'POST', 
        query: { collection_id: collection_id },
        body: dtxsids
      }
    )
  }

  // Clear all values in store on logout
  function reset() {
    currentChemicals.value = []
  }

  return { 
    currentChemicals,
    currentDtxsids,
    chemicalSetsMap,
    chemicalsLoaded,
    fetchChemicals, 
    createChemicalsInCollection,
    reset 
  }
})
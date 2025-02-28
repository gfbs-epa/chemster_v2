import { defineStore } from 'pinia'
import { REST_API_ENDPOINT } from '~/utils/constants'
import type { Chemical } from '~/utils/types'
import { useWorkspaceStore } from './workspaces'
import { useListStore } from './lists'

const API_CHEMICALS_ENDPOINT = `${REST_API_ENDPOINT}/chemicals`

export const useChemicalStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentDtxsids = ref([]) as Ref<string[]>

  // Fetch DTXSIDs from back-end API based on selected collections
  async function fetchDtxsids() {
    const workspaceStore = useWorkspaceStore()
    let recursive = true
    let collectionIds = [workspaceStore.currentWorkspaceId]

    const listStore = useListStore()
    if (listStore.currentListIds.length > 0) {
      recursive = false
      collectionIds = listStore.currentListIds
    }

    currentDtxsids.value = await useNuxtApp().$api<Array<Chemical>>(
      API_CHEMICALS_ENDPOINT, 
      { query: { recursive: recursive, collection_id: collectionIds } }
    )
    .then((chemicals) => { return chemicals.map(chemicalObjectToDtxsid) })
  }

  // Upload a set of chemicals to the back-end and associate them with a collection
  async function createChemicals(dtxsids: string[], collection_id: number) {
    return await useNuxtApp().$api<Chemical[]>(API_CHEMICALS_ENDPOINT, 
      { method: 'POST', 
        query: { batch: true, collection_id: collection_id },
        body: dtxsids.map((d) => { return { dtxsid: d } })
      }
    )
  }

  // Helper to reset whole store when user logs out
  function reset() {
    currentDtxsids.value = []
  }

  function chemicalObjectToDtxsid(chemical: Chemical) {
    return chemical.dtxsid
  }

  return { currentDtxsids, fetchDtxsids, createChemicals, reset }
})
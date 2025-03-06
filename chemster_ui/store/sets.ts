import { defineStore } from 'pinia'
import { REST_API_COLLECTIONS_ENDPOINT } from '~/utils/constants'
import type { Collection } from '~/utils/types'

export const useSetStore = defineStore('sets',  () => {
  // All sets available in current workspace
  const sets = ref(Array<Collection>())
  // Sets selected by user in interface
  const currentSetIds = ref(Array<number>())

  // Getter to check if any sets are available
  const setsAvailable = computed(() => sets.value.length > 0)

  // Getter for current set names
  const currentSetNames = computed(() => sets.value.filter((i) => currentSetIds.value.includes(i['id']))?.map((i) => i.name))

  // Fetch available sets in workspace from back-end
  async function fetchSets(workspaceId: number) {
    return useNuxtApp().$api<Array<Collection>>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { query: { super_id: workspaceId } }
    )
    .then(async (resp) => sets.value = resp)
  }

  // Create a new set and add it to current selection
  async function createAndLoadSet(name: string, workspaceId: number) {
    return useNuxtApp().$api.raw<Collection>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { method: 'POST', body: { name: name, super_id: workspaceId } }
    )
    .then((response) => {
      const newSet = response._data as Collection
      sets.value.push(newSet)
      currentSetIds.value.push(newSet.id)
      return newSet
    })
  }

  async function deleteSet(id: number | null) {
    if (id === null) return
    return useNuxtApp().$api(`${REST_API_COLLECTIONS_ENDPOINT}/${id}`, { method: 'DELETE' })
    .then(() => {
      // After successful deletion, remove the set from the store
      sets.value = sets.value.filter((i) => i.id !== id)
      // If set was currently selected, remove it from selection
      currentSetIds.value = currentSetIds.value.filter((i) => i !== id)
    })
  }

  function reset() {
    sets.value = []
    currentSetIds.value = []
  }

  return {
    sets,
    currentSetIds,
    setsAvailable,
    currentSetNames,
    fetchSets,
    createAndLoadSet,
    deleteSet,
    reset
  }
})

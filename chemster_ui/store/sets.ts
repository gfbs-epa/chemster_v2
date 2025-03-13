import { defineStore } from 'pinia'
import { REST_API_COLLECTIONS_ENDPOINT } from '~/utils/constants'
import type { Collection } from '~/utils/types'

export const useSetStore = defineStore('sets',  () => {
  // All sets available in current workspace
  const sets = ref(Array<Collection>())
  // Sets selected by user in interface
  const currentSetIds = ref(Array<number>())

  // Getter for set names as ID -> name map
  const setNamesMap = computed(() => new Map(sets.value.map((set) => [set.id, set.name])))
  // Getter for IDs of all available sets - used for selector defaults
  const setIds = computed(() => sets.value.map((set) => set.id))
  // Getter to check if any sets are available
  const setsAvailable = computed(() => sets.value.length > 0)
  // Getter to check if any sets are available
  const setsLoaded = computed(() => currentSetIds.value.length > 0)
  // Getter for current set names
  const currentSetNames = computed(() => sets.value.filter((i) => currentSetIds.value.includes(i['id']))?.map((i) => i.name))

  // Fetch available sets in workspace from back-end
  async function fetchSets(workspaceId: number) {
    return useNuxtApp().$api<Array<Collection>>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { query: { super_id: workspaceId } }
    )
    .then((resp) => {
      // Always start by selecting all available sets
      sets.value = resp
      currentSetIds.value = setIds.value
    })
  }

  // Create a new set and load it in the interface
  async function createAndLoadSet(name: string, workspaceId: number) {
    return useNuxtApp().$api.raw<Collection>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { method: 'POST', body: { name: name, super_id: workspaceId } }
    )
    .then((response) => {
      // After successful creation, load the new set
      const newSet = response._data as Collection
      sets.value.push(newSet)
      currentSetIds.value.push(newSet.id)
      return newSet
    })
    // Do not catch exceptions, as they will propagate to trigger user alerts
  }

  // Delete an existing set
  async function deleteSet(id: number | null) {
    if (id === null) return // Null check to take care of typing

    return useNuxtApp().$api(`${REST_API_COLLECTIONS_ENDPOINT}/${id}`, { method: 'DELETE' })
    .then(() => {
      // After successful deletion, remove the set from the store
      sets.value = sets.value.filter((i) => i.id !== id)
      // If set was currently selected, remove it from selection
      currentSetIds.value = currentSetIds.value.filter((i) => i !== id)
    })
  }

  // Clear all values in the store on logout
  function reset() {
    sets.value = []
    currentSetIds.value = []
  }

  return {
    sets,
    currentSetIds,
    setNamesMap,
    setIds,
    setsAvailable,
    setsLoaded,
    currentSetNames,
    fetchSets,
    createAndLoadSet,
    deleteSet,
    reset
  }
})

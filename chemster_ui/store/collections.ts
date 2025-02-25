import { defineStore } from 'pinia'
import { useAPI } from '~/composables/useAPI'
import { REST_API_ENDPOINT } from '~/utils/constants'
import type { Collection } from '~/utils/types'

const COLLECTIONS_ENDPOINT = `${REST_API_ENDPOINT}/collections`

export const useCollectionsStore = defineStore('collections',  () => {
  // All top-level workspaces available in database
  const workspaces = ref(Array<Collection>())
  // Workspace selected by user in collections panel
  const currentWorkspaceId = ref()
  // All lists available in selected workspace
  const workspaceLists = ref(Array<Collection>())
  // Lists selected by user in collections panel
  const currentListIds: Ref<number[]> = ref([])

  // Fetch top-level workspaces from back-end
  async function fetchWorkspaces() {
    const { data } = await useAPI<Array<Collection>>(`${COLLECTIONS_ENDPOINT}/master`)
    workspaces.value = data.value as Array<Collection>
    console.log(data)
  }

  // When workspace is changed, fetch available lists from API and clear previous selections
  async function updateWorkspace(workspaceId: number) {
    currentWorkspaceId.value = workspaceId
    const { data } = await useAPI<Array<Collection>>(COLLECTIONS_ENDPOINT, { query: { super_id: workspaceId } })
    workspaceLists.value = data.value as Array<Collection>
    currentListIds.value = []
  }

  // Helper to reset whole store when user logs out
  function reset() {
    workspaces.value = Array<Collection>()
    currentWorkspaceId.value = null
    workspaceLists.value = Array<Collection>()
    currentListIds.value = []
  }

  return {
    workspaces,
    currentWorkspaceId,
    workspaceLists,
    currentListIds,
    fetchWorkspaces, 
    updateWorkspace,
    reset
  }
})

import { defineStore } from 'pinia'
import { useAuthFetch } from '~/composables/useAuthFetch'

const collectionsEndpoint = 'api/rest/collections'
type Collection = { id: number, name: string, super_id: number, owner_id: number }

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
    const { data } = await useAuthFetch<Array<Collection>>(`${collectionsEndpoint}/master`)
    workspaces.value = data.value as Array<Collection>
    console.log(data)
  }

  // When workspace is changed, fetch available lists from API and clear previous selections
  async function updateWorkspace(workspaceId: number) {
    currentWorkspaceId.value = workspaceId
    const { data } = await useAuthFetch<Array<Collection>>(collectionsEndpoint, { query: { super_id: workspaceId } })
    workspaceLists.value = data.value as Array<Collection>
    currentListIds.value = []
  }

  return {
    workspaces,
    currentWorkspaceId,
    workspaceLists,
    currentListIds,
    fetchWorkspaces, 
    updateWorkspace
  }
})

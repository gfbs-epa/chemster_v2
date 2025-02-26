import { defineStore } from 'pinia'
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

  const workspacesAvailable = computed(() => workspaces.value.length > 0)

  const currentWorkspaceName = computed(() => {
    const currentWorkspace = workspaces.value.find(item => item['id'] === currentWorkspaceId.value)
    return !!currentWorkspace ? currentWorkspace.name : ''
  })

  // Fetch top-level workspaces from back-end
  async function fetchWorkspaces() {
    workspaces.value = await useNuxtApp().$api<Array<Collection>>(COLLECTIONS_ENDPOINT, { query: { super_id: useRuntimeConfig().public.masterCollectionId } })
  }

  // When workspace is changed, fetch available lists from API and clear previous selections
  async function fetchWorkspaceLists() {
    workspaceLists.value = await useNuxtApp().$api<Array<Collection>>(COLLECTIONS_ENDPOINT, { query: { super_id: currentWorkspaceId.value } })
  }

  // Create a new workspace
  async function createWorkspace(name: string) {
    await postCollection(name, parseInt(useRuntimeConfig().public.masterCollectionId))
      .then(async (response) => {
        currentWorkspaceId.value = response._data?.id
        workspaceLists.value = []
        await fetchWorkspaces()
        return true
      })
      .catch(() => { return false })
  }

  // Helper to post a new collection (either workspace or list) since format is identical
  async function postCollection(name: string, super_id: number) {
    return await useNuxtApp().$api.raw<Collection>(COLLECTIONS_ENDPOINT, { method: 'POST', body: { name: name, super_id: super_id } })
  }

  async function deleteWorkspace(id: number) {
    await deleteCollection(id)
      .then(async () => {
        if (id === currentWorkspaceId.value) {
          await fetchWorkspaces()
          currentWorkspaceId.value = null
          workspaceLists.value = []
        }
      })
  }

  // Helper function to delete a collection (either workspace or list) since format is identical
  async function deleteCollection(id: number) {
    return await useNuxtApp().$api(`${COLLECTIONS_ENDPOINT}/${id}`, { method: 'DELETE' })
  }

  // Helper to reset whole store when user logs out
  function reset() {
    workspaces.value = Array<Collection>()
    currentWorkspaceId.value = null
    workspaceLists.value = []
  }

  return {
    workspaces,
    currentWorkspaceId,
    workspacesAvailable,
    currentWorkspaceName,
    workspaceLists,
    fetchWorkspaces, 
    fetchWorkspaceLists,
    createWorkspace,
    deleteWorkspace,
    reset
  }
})

import { defineStore } from 'pinia'
import { REST_API_COLLECTIONS_ENDPOINT } from '~/utils/constants'
import type { Collection } from '~/utils/types'

export const useWorkspaceStore = defineStore('workspaces',  () => {
  // All top-level workspaces available in database
  const workspaces = ref(Array<Collection>())
  // Workspace selected by user in collections panel
  const currentWorkspaceId = ref()

  // Getter to check if any workspaces exist for user
  const workspacesAvailable = computed(() => workspaces.value.length > 0)

  // Getter for current workspace name
  const currentWorkspaceName = computed(() => {
    const currentWorkspace = workspaces.value.find(item => item['id'] === currentWorkspaceId.value)
    return !!currentWorkspace ? currentWorkspace.name : ''
  })

  // Fetch available workspaces for user from back-end
  async function fetchWorkspaces() {
    workspaces.value = await useNuxtApp().$api<Array<Collection>>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { query: { super_id: useRuntimeConfig().public.masterCollectionId } }
    )
  }

  // Create a new workspace
  async function createWorkspace(name: string) {
    await useNuxtApp().$api.raw<Collection>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { method: 'POST', body: { name: name, super_id: useRuntimeConfig().public.masterCollectionId } }
    )
    .then(async (response) => {
      // After successful creation, go to new workspace
      const newWorkspace = response._data as Collection
      workspaces.value.push(newWorkspace)
      currentWorkspaceId.value = newWorkspace.id
      return true
    })
    .catch(() => { return false })
  }

  async function deleteWorkspace(id: number) {
    await useNuxtApp().$api(`${REST_API_COLLECTIONS_ENDPOINT}/${id}`, { method: 'DELETE' })
    .then(async () => {
      if (id === currentWorkspaceId.value) {
        currentWorkspaceId.value = null
      }
    })
  }

  // Helper to reset whole store when user logs out
  function reset() {
    workspaces.value = Array<Collection>()
    currentWorkspaceId.value = null
  }

  return {
    workspaces,
    currentWorkspaceId,
    workspacesAvailable,
    currentWorkspaceName,
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
    reset
  }
})

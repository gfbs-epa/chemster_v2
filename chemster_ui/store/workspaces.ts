import { defineStore } from 'pinia'
import { REST_API_COLLECTIONS_ENDPOINT } from '~/utils/constants'
import type { Collection } from '~/utils/types'

export const useWorkspaceStore = defineStore('workspaces',  () => {
  // All top-level workspaces available in database
  const workspaces = ref(Array<Collection>())
  // Workspace selected by user in interface
  const currentWorkspaceId = ref()

  // Getter to check if any workspaces exist for user
  const workspacesAvailable = computed(() => workspaces.value.length > 0)

  // Getter to check if a workspace is currently loaded
  const workspaceLoaded = computed(() => !!currentWorkspaceId.value)

  // Getter for current workspace name
  const currentWorkspaceName = computed(() => workspaces.value.find(item => item['id'] === currentWorkspaceId.value)?.name)

  // Runtime config to use in functions
  const config = useRuntimeConfig()

  // Fetch available workspaces for user from back-end
  async function fetchWorkspaces() {
    return useNuxtApp().$api<Array<Collection>>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { query: { super_id: config.public.masterCollectionId } }
    )
    .then((resp) => workspaces.value = resp)
  }

  // Create a new workspace and set it as active
  async function createAndLoadWorkspace(name: string) {
    return useNuxtApp().$api.raw<Collection>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { method: 'POST', body: { name: name, super_id: config.public.masterCollectionId } }
    )
    .then(async (response) => {
      // After successful creation, go to new workspace
      const newWorkspace = response._data as Collection
      workspaces.value.push(newWorkspace)
      currentWorkspaceId.value = newWorkspace.id
    })
  }

  async function deleteWorkspace(id: number | null) {
    if (id === null) return
    return useNuxtApp().$api(`${REST_API_COLLECTIONS_ENDPOINT}/${id}`, { method: 'DELETE' })
    .then(() => {
      // After successful deletion, remove the workspace from the store
      workspaces.value = workspaces.value.filter((i) => i.id != id)
      // If we just deleted the workspace we were in, set it to null
      if (id === currentWorkspaceId.value) {
        currentWorkspaceId.value = null
      }
    })
  }

  function reset() {
    workspaces.value = []
    currentWorkspaceId.value = null
  }

  return {
    workspaces,
    currentWorkspaceId,
    workspacesAvailable,
    workspaceLoaded,
    currentWorkspaceName,
    fetchWorkspaces,
    createAndLoadWorkspace,
    deleteWorkspace,
    reset
  }
})

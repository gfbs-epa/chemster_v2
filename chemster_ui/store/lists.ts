import { defineStore } from 'pinia'
import { REST_API_COLLECTIONS_ENDPOINT } from '~/utils/constants'
import { type Collection } from '~/utils/types'
import { useWorkspaceStore } from './workspaces'

export const useListStore = defineStore('lists',  () => {
  // All lists available in current workspace
  const lists = ref(Array<Collection>())
  // Lists selected by user in interface
  const currentListIds = ref(Array<number>())

  // Getter to check if any workspaces exist for user
  const listsAvailable = computed(() => lists.value.length > 0)

  // Getter for current list names
  const currentListNames = computed(() => {
    const currentLists = lists.value.filter(item => currentListIds.value.includes(item['id']))
    return currentLists.length > 0 ? currentLists.map(item => item.name) : []
  })

  // Fetch available lists in workspace from back-end
  async function fetchLists() {
    const workspaceStore = useWorkspaceStore()
    lists.value = await useNuxtApp().$api<Array<Collection>>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { query: { super_id: workspaceStore.currentWorkspaceId } }
    )
  }

  // Create a new list
  async function createList(name: string, workspaceId: number) {
    return await useNuxtApp().$api.raw<Collection>(
      REST_API_COLLECTIONS_ENDPOINT, 
      { method: 'POST', body: { name: name, super_id: workspaceId } }
    )
    .then((response) => {
      const newList = response._data as Collection
      lists.value.push(newList)
      currentListIds.value.push(newList.id)
      return newList
    })
  }

  // Helper to reset whole store when user logs out
  function reset() {
    lists.value = Array<Collection>()
    currentListIds.value = []
  }

  return {
    lists,
    currentListIds,
    listsAvailable,
    currentListNames,
    fetchLists,
    createList,
    reset
  }
})

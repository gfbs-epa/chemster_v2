import { defineStore } from 'pinia'
import { useAuthFetch } from '~/composables/useAuthFetch'

const chemicalsEndpoint = 'api/rest/chemicals'
export type Chemical = { dtxsid: string }

export const useChemicalsStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentChemicals = ref(Array<Chemical>())

  // Fetch chemicals from back-end
  async function fetchChemicals(collectionIds: number[], recursive: boolean) {
    const { data } = await useAuthFetch<Array<Chemical>>(chemicalsEndpoint, { query: { recursive: recursive, collection_id: collectionIds } })
    currentChemicals.value = data.value as Array<Chemical>
  }

  // Helper to reset whole store when user logs out
  function reset() {
    currentChemicals.value = Array<Chemical>()
  }

  return { currentChemicals, fetchChemicals, reset }
})
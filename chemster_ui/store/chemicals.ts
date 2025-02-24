import { defineStore } from 'pinia'

const chemicalsEndpoint = 'api/rest/chemicals'
export type Chemical = { dtxsid: string }

export const useChemicalsStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentChemicals = ref(Array<Chemical>())

  // Fetch chemicals from back-end
  async function fetchChemicals(collectionIds: number[], recursive: boolean) {
    const data = await useNuxtApp().$authFetch<Array<Chemical>>(chemicalsEndpoint, { query: { recursive: recursive, collection_id: collectionIds } })
    currentChemicals.value = data
  }

  return { currentChemicals, fetchChemicals }
})
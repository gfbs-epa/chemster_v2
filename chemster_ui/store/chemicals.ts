import { defineStore } from 'pinia'
import { useAPI } from '~/composables/useAPI'
import { REST_API_ENDPOINT } from '~/utils/constants'
import type { Chemical } from '~/utils/types'

const CHEMICALS_ENDPOINT = `${REST_API_ENDPOINT}/chemicals`

export const useChemicalsStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentChemicals = ref(Array<Chemical>())

  // Fetch chemicals from back-end
  async function fetchChemicals(collectionIds: number[], recursive: boolean) {
    const { data } = await useAPI<Array<Chemical>>(CHEMICALS_ENDPOINT, { query: { recursive: recursive, collection_id: collectionIds } })
    currentChemicals.value = data.value as Array<Chemical>
  }

  // Helper to reset whole store when user logs out
  function reset() {
    currentChemicals.value = Array<Chemical>()
  }

  return { currentChemicals, fetchChemicals, reset }
})
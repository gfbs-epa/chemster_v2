import { defineStore } from 'pinia'
import { PROPERTY_SOURCES, REST_API_ENDPOINT } from '~/utils/constants'
import type { Chemical, CTXProperty, PropertyValue } from '~/utils/types'
import { useWorkspaceStore } from './workspaces'
import { useListStore } from './lists'

const API_CHEMICALS_ENDPOINT = `${REST_API_ENDPOINT}/chemicals`
const CTX_PROPERTIES_ENDPOINT = 'ctx/property/search/by-dtxsid/'

export const useChemicalStore = defineStore('chemicals',  () => {
  // Chemicals in browser based on collections selected by user
  const currentDtxsids = ref([]) as Ref<string[]>
  const storedProperties = ref([]) as Ref<PropertyValue[]>

  // Tracking whether stored chemicals and properties are synchronized, since property query
  // is hefty and runs only when necessary
  const storedPropertiesDtxsidsSet = computed(() => new Set(storedProperties.value.map((item) => item.dtxsid)))
  const currentDtxsidsSet = computed(() => new Set(currentDtxsids.value))
  const dtxsidsToAdd = computed(() => Array.from(currentDtxsidsSet.value.difference(storedPropertiesDtxsidsSet.value)))
  const dtxsidsToRemove = computed(() => storedPropertiesDtxsidsSet.value.difference(currentDtxsidsSet.value))
  const needsUpdate = computed(() => dtxsidsToAdd.value.length > 0 || dtxsidsToRemove.value.size > 0)

  // Fetch DTXSIDs from back-end API based on selected collections
  async function fetchDtxsids() {
    // By default, fetch everything in the workspace
    const workspaceStore = useWorkspaceStore()
    let recursive = true
    let collectionIds: number[] = [workspaceStore.currentWorkspaceId.value]

    // If specific lists were selected, use those instead
    const listStore = useListStore()
    if (listStore.currentListIds.value.length > 0) {
      recursive = false
      collectionIds = listStore.currentListIds.value
    }

    // Run the API query, then map from chemical objects to DTXSID strings
    currentDtxsids.value = await useNuxtApp().$api<Array<Chemical>>(
      API_CHEMICALS_ENDPOINT, 
      { query: { recursive: recursive, collection_id: collectionIds } }
    )
    .then((chemicals) => { return chemicals.map((item) => item.dtxsid) })
  }

  async function fetchProperties() {
    // Remove any properties no longer needed from store
    storedProperties.value = storedProperties.value.filter((p) => !dtxsidsToRemove.value.has(p.dtxsid))

    // Break list of compounds to be added into chunks to avoid overloading CTX API
    const limit = parseInt(useRuntimeConfig().public.ctxApiRequestLimit)
    let chunks = []
    for (let i = 0; i < dtxsidsToAdd.value.length; i += limit) {
      chunks.push(dtxsidsToAdd.value.slice(i, i + limit))
    }

    // Run queries concurrently and add results to stored properties
    storedProperties.value = storedProperties.value.concat((await Promise.all(
      chunks.map((chunk) => 
        useNuxtApp().$ctx<Array<CTXProperty>>(CTX_PROPERTIES_ENDPOINT, { method: 'POST', body: chunk })
        .then((props) => {
          return props.filter((p) => p.propType == 'predicted' && PROPERTY_SOURCES.includes(p.source))
          .map((p) => { return { dtxsid: p.dtxsid, name: p.propertyId, source: p.source, value: p.value } as PropertyValue })
        })
      )
    )).flat())
  }

  // Upload a set of chemicals to the back-end and associate them with a collection
  async function createChemicals(dtxsids: string[], collection_id: number) {
    return await useNuxtApp().$api<Chemical[]>(API_CHEMICALS_ENDPOINT, 
      { method: 'POST', 
        query: { batch: true, collection_id: collection_id },
        body: dtxsids.map((d) => { return { dtxsid: d } })
      }
    )
  }

  // Helper to reset whole store when user logs out
  function reset() {
    currentDtxsids.value = []
    storedProperties.value = []
  }

  return { currentDtxsids, storedProperties, needsUpdate, fetchDtxsids, fetchProperties, createChemicals, reset }
})
import { defineStore } from 'pinia'
import type { CTXList, CTXListDisplay, CTXProperty } from '~/utils/types'
import { CTX_ENDPOINT } from '~/utils/constants'

const CTX_LIST_ENDPOINT = `${CTX_ENDPOINT}/list/`
const CTX_PROPERTY_ENDPOINT = `${CTX_ENDPOINT}/property/predicted/name`
const MEDIA_LIST_PREFIX = 'MMDB'

// Store for all app resources sourced from CTX APIs
export const useCTXStore = defineStore('ctx',  () => {
  // Available lists on CompTox Chemicals Dashboard
  const lists = reactive({ media: [] as CTXListDisplay[], other: [] as CTXListDisplay[] })
  // Available properties from CTX APIs
  const properties = ref([]) as Ref<CTXProperty[]>

  // Available properties as a map from property ID -> display name for visualization
  const propertyNamesMap = computed(() => new Map(properties.value.map((prop) => [prop.propertyId, prop.name])))

  // Fetch available public lists from CTX API
  async function fetchLists() {
    return useNuxtApp().$ctx<Array<CTXList>>(CTX_LIST_ENDPOINT)
    .then((ctxLists) => {
      // Pick out properties of interest and format to use in selector lists
      ctxLists.forEach((ctxList) => {
        let disp = { 
          title: ctxList.listName,
          value: ctxList.listName,
          props: { subtitle: `${ctxList.label} (${ctxList.chemicalCount})` }
        } as CTXListDisplay

        // Assign lists to media or "other" selector based on name
        if (disp.title.startsWith(MEDIA_LIST_PREFIX)) {
          lists.media.push(disp)
        } else {
          lists.other.push(disp)
        }
      })
    })
  }

  // Fetch available predicted properties from CTX APIs
  async function fetchProperties() {
    return useNuxtApp().$ctx<CTXProperty[]>(CTX_PROPERTY_ENDPOINT)
    .then((props) => properties.value = props)
  }

  // Fetch both lists and properties to initialize store
  async function fetchAll() {
    return Promise.all([fetchLists(), fetchProperties()])
  }

  // Clear all values in the store on logout
  function reset() {
    lists.media = []
    lists.other = []
    properties.value = []
  }

  return {
    lists,
    properties,
    propertyNamesMap,
    fetchAll,
    reset
  }
})

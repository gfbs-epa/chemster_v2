import { defineStore } from 'pinia'
import type { CTXList, CTXListDisplay, CTXProperty } from '~/utils/types'
import { CTX_ENDPOINT } from '~/utils/constants'

const CTX_LIST_ENDPOINT = `${CTX_ENDPOINT}/list/`
const CTX_PROPERTY_ENDPOINT = `${CTX_ENDPOINT}/property/predicted/name`
const MEDIA_LIST_PREFIX = 'MMDB'

export const useDashboardStore = defineStore('dashboard',  () => {
  // Available lists on CompTox Chemicals Dashboard
  const lists = reactive({ media: [] as CTXListDisplay[], other: [] as CTXListDisplay[] })
  // Available properties from CTX APIs
  const properties = ref([]) as Ref<CTXProperty[]>

  // Get the display name of a property from its ID
  function getPropertyNameById(id: string) {
    return properties.value.find((p) => p.propertyId == id)?.name
  }

  // Fetch available public lists from CTX API
  async function fetchLists() {
    return useNuxtApp().$ctx<Array<CTXList>>(CTX_LIST_ENDPOINT)
    .then((ctxLists) => {
      // Pick out properties of interest and format to use in selector lists
      ctxLists.forEach((ctxList) => {
        let dispList = { 
          title: ctxList.listName,
          value: ctxList.listName,
          props: { subtitle: `${ctxList.label} (${ctxList.chemicalCount})` }
        } as CTXListDisplay

        // Assign lists to media or "other" selector based on name
        if (dispList.title.startsWith(MEDIA_LIST_PREFIX)) {
          lists.media.push(dispList)
        } else {
          lists.other.push(dispList)
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

  function reset() {
    lists.media = []
    lists.other = []
    properties.value = []
  }

  return {
    lists,
    properties,
    getPropertyNameById,
    fetchAll,
    reset
  }
})

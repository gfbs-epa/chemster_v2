import { defineStore } from 'pinia'
import { type CTXList, type DashboardListItem } from '~/utils/types'

const CTX_LISTS_ENDPOINT = 'ctx/list/?projection=chemicallistall'
const MEDIA_LISTS_PREFIX = "MMDB"

export const useDashboardStore = defineStore('dashboard',  () => {
  // Dashboard multimedia monitoring lists
  const mediaLists = ref(Array<DashboardListItem>())
  // Other dashboard lists
  const otherLists = ref(Array<DashboardListItem>())

  // Fetch all publicly available dashboard lists from the CTX APIs
  async function fetchDashboardLists() {
    const ctxLists = await useNuxtApp().$ctx<Array<CTXList>>(CTX_LISTS_ENDPOINT)
    // Pick out properties of interest to avoid storing excessive data
    ctxLists.forEach((ctxList) => {
      let item = ctxListToListItem(ctxList)
      if (item.title.startsWith(MEDIA_LISTS_PREFIX)) {
        mediaLists.value.push(item)
      } else {
        otherLists.value.push(item)
      }
    })
  }

  // Helper to map a CTX API list response to a useful list detail item
  function ctxListToListItem(ctxList: CTXList) {
    return { 
      title: ctxList.listName,
      value: ctxList.listName,
      props: { subtitle: `${ctxList.label} (${ctxList.chemicalCount})` }
    } as DashboardListItem
  }

  return { mediaLists, otherLists, fetchDashboardLists }
})

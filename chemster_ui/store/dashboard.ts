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
    ctxLists.forEach((list) => {
      let item = { 
        title: list.listName,
        value: list.listName,
        props: { subtitle: `${list.label} (${list.chemicalCount})` }
      } as DashboardListItem

      if (item.title.startsWith(MEDIA_LISTS_PREFIX)) {
        mediaLists.value.push(item)
      } else {
        otherLists.value.push(item)
      }
    })
  }

  return { mediaLists, otherLists, fetchDashboardLists }
})

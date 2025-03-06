import { defineStore } from 'pinia'
import { VIZ_API_ENDPOINT } from '~/utils/constants'
import type { PropertyData } from '~/utils/types'

const VIZ_API_PROPERTY_TABLE_ENDPOINT = `${VIZ_API_ENDPOINT}/properties`

export const usePropertyStore = defineStore('property',  () => {
  // All chemical property data currently stored as map in columnar format
  const currentPropertyData = ref({ columns: [], data: [], index: [] }) as Ref<PropertyData>

  // Getter to check if any properties are stored
  const propertyDataLoaded = computed(() => currentPropertyData.value.columns.length > 0)

  // Get an array containing the currently stored values of a single property, on a log or linear scale, from its ID
  function getPropertyValuesArrayById(propertyId: string, log: boolean) {
    const columnId = currentPropertyData.value.columns.indexOf(propertyId)
    const values = currentPropertyData.value.data.map((row) => row[columnId])
    return log ? values.map(Math.log10) : values
  }

  // Fetch property data from the back-end
  async function fetchPropertyData(dtxsids: string[], ids: string[], source: string) {
    return useNuxtApp().$api<PropertyData>(
      VIZ_API_PROPERTY_TABLE_ENDPOINT, 
      { method: 'POST', body: dtxsids, query: { property_source: source, property_id: ids } }
    )
    .then((response) => {
      currentPropertyData.value = response
    })
  }

  function reset() {
    currentPropertyData.value = { columns: [], data: [], index: [] } as PropertyData
  }

  return {
    currentPropertyData,
    propertyDataLoaded,
    getPropertyValuesArrayById,
    fetchPropertyData,
    reset
  }
})
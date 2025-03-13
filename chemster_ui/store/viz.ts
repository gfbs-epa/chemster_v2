import { defineStore } from 'pinia'
import { DEFAULT_COLOR, VIZ_API_ENDPOINT } from '~/utils/constants'
import type { HSLA, PropertyTable } from '~/utils/types'
import { useChemicalStore } from './chemicals'

const VIZ_API_PROPERTY_TABLE_ENDPOINT = `${VIZ_API_ENDPOINT}/property-table`

export const useVizStore = defineStore('viz',  () => {
  // User defined colors for sets and slices
  const colorMap = ref(new Map<number, HSLA>())
  // All chemical property data currently stored as map in columnar format
  const propertyTable = reactive({ index: [] as string[], columns: [] as string[], data: [] as number[][] })
  // User created scatterplots
  const propertyScatterplots = ref([]) as Ref<{ xprop: string, yprop: string, key: string }[]>

  // Getter to check if any properties are stored
  const propertyTableLoaded = computed(() => propertyTable.columns.length > 0)
  // Color index for all plots
  // I really dislike the calling-another-store-in-a-store pattern but it is the only clean way to make this work :/
  const colorIndex = computed(() => propertyTable.index.map((d) => getSetColor(useChemicalStore().chemicalSetsMap.get(d) || [])))
  // Getters for keys of current scatterplots to prohibit duplication
  const propertyScatterplotKeys = computed(() => propertyScatterplots.value.map((p) => p.key))

  function getSetColor(setIds: number[]) {
    if (setIds.length === 1 && colorMap.value.has(setIds[0])) {
      return hslaToHex(colorMap.value.get(setIds[0]) || DEFAULT_COLOR)
    } else if (setIds.length >= 1) {
      // If a point is a member of more than one set, interpolate their colors in HSL space
      let interpColor = { h: 0, s: 0, l: 0, a: 1 } as HSLA
      let countColors = 0
      setIds.forEach((id) => {
        if (colorMap.value.has(id)) {
          countColors++
          let color = colorMap.value.get(id)
          interpColor.h += color.h
          interpColor.s += color.s
          interpColor.l += color.l
        }
      })

      if (countColors == 0) {
        return hslaToHex(DEFAULT_COLOR)
      } else {
        interpColor.h /= countColors
        interpColor.s /= countColors
        interpColor.l /= countColors
        return hslaToHex(interpColor)
      }
    } else {
      return hslaToHex(DEFAULT_COLOR)
    }
  }

  // Fetch property data from the back-end
  async function fetchPropertyTable(dtxsids: string[], propIds: string[], propSource: string) {
    return useNuxtApp().$api<PropertyTable>(
      VIZ_API_PROPERTY_TABLE_ENDPOINT, 
      { method: 'POST', body: dtxsids, query: { property_source: propSource, property_id: propIds } }
    )
    .then((response) => {
      propertyTable.index = response.index
      propertyTable.columns = response.columns
      propertyTable.data = response.data
    })
  }

  // Get an array containing the currently stored values of a single property, on a log or linear scale, from its ID
  function getPropertyColumnValues(propertyId: string, log: boolean) {
    const columnId = propertyTable.columns.indexOf(propertyId)
    const values = propertyTable.data.map((row) => row[columnId])
    return log ? values.map(Math.log10) : values
  }

  // Add a new property scatterplot
  function addPropertyScatterplot(xprop: string, yprop: string) {
    propertyScatterplots.value.push({
      xprop: xprop,
      yprop: yprop,
      key: `${xprop}_${yprop}`
    })
  }

  // Delete an existing property scatterplot
  function deletePropertyScatterplot(i: number) {
    propertyScatterplots.value.splice(i, 1)
  }

  // Helper function to convert HSLA colors -> hex for interface elements
  function hslaToHex(hsla: HSLA) {
    const a = hsla.s * Math.min(hsla.l, 1 - hsla.l)
    const f = (n: number) => {
      const k = (n + hsla.h / 30) % 12
      const color = hsla.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  function reset() {
    colorMap.value = new Map<number, HSLA>()
    propertyTable.index = []
    propertyTable.columns = []
    propertyTable.data = []
    propertyScatterplots.value = []
  }

  return {
    colorMap,
    propertyTable,
    colorIndex,
    propertyTableLoaded,
    fetchPropertyTable,
    getPropertyColumnValues,
    propertyScatterplots,
    propertyScatterplotKeys,
    addPropertyScatterplot,
    deletePropertyScatterplot,
    hslaToHex,
    reset
  }
})
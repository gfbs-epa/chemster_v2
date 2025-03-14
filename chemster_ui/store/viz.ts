import { defineStore } from 'pinia'
import { DEFAULT_COLOR, VIZ_API_ENDPOINT } from '~/utils/constants'
import type { PropertyTable } from '~/utils/types'
import { hslaInterp, hslaToHex, type HSLA } from '~/utils/colors'
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
  const colorIndex = computed(() => propertyTable.index.map((d) => getSetColor(useChemicalStore().chemicalSetsMap.get(d) || [])))
  // Getters for keys of current scatterplots to prohibit duplication
  const propertyScatterplotKeys = computed(() => propertyScatterplots.value.map((p) => p.key))

  // Compute the color for a plot point based on its set membership
  function getSetColor(setIds: number[]) {
    if (setIds.length === 1 && colorMap.value.has(setIds[0])) {
      return hslaToHex(colorMap.value.get(setIds[0]) || DEFAULT_COLOR)
    } else if (setIds.length >= 1) {
      // If a point is a member of more than one set, interpolate their colors in HSL space
      const colors = setIds.map((id) => colorMap.value.get(id)).filter((col) => !!col)
      // The circular HSLA interpolate-reduce strategy results in unequal weighting of colors
      // but the results are much prettier than straight interpolation in any color space
      return hslaToHex(colors.length === 0 ? DEFAULT_COLOR : colors.reduce(hslaInterp))
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

  function getHistogramTraces(propertyId: string, log: boolean, bins: number) {
    const allx = getPropertyColumnValues(propertyId, log)
    return [...new Set(colorIndex.value)].map((color) => {
      return {
        x: allx.filter((val, i) => colorIndex.value[i] === color),
        type: 'histogram',
        nbinsx: bins,
        marker: { color: color }
      }
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
    getHistogramTraces,
    propertyScatterplots,
    propertyScatterplotKeys,
    addPropertyScatterplot,
    deletePropertyScatterplot,
    reset
  }
})
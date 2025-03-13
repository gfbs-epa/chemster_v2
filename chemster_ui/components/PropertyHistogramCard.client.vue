<template>
  <v-card class="bg-grey-lighten-3" flat>
    <v-card-text>
      <div ref="plt"></div>
      <v-slider v-model="bins" min="10" max="100" step="10" color="primary" class="pt-5" hide-details>
        <template v-slot:prepend>
          <v-text-field label="Bins" v-model="bins" density="compact" variant="outlined" type="number" style="width: 80px" hide-details />
          <v-tooltip activator="parent" location="bottom">Bins are optimized to fit data and may not match input exactly</v-tooltip>
        </template>
        <template v-slot:append>
          <v-switch v-model="log" label="Log scale?" color="primary" hide-details :disabled="prop.startsWith('log')" />
        </template>
      </v-slider>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { NuxtPlotlyConfig, NuxtPlotlyData, NuxtPlotlyHTMLElement, NuxtPlotlyLayout } from 'nuxt-plotly'
import { useCTXStore } from '~/store/ctx'
import { useVizStore } from '~/store/viz'

const DEFAULT_BINS = 30

// Load plotly isntance
const { $plotly } = useNuxtApp()

// Load property data store
const vizStore = useVizStore()

// Retrieve input properties (ID of property for plotting)
const props = defineProps({ prop: { type: String, required: true } })
const { prop } = props

// Track state of plot and user inputs for log scale and nbins
const plt: NuxtPlotlyHTMLElement = ref(null)
const log = ref(false)
const bins = ref(DEFAULT_BINS)

// Reactive data for plotting
const data: Ref<NuxtPlotlyData> = ref([{
  x: vizStore.getPropertyColumnValues(prop, false),
  type: 'histogram',
  nbinsx: DEFAULT_BINS,
  marker: { color: vizStore.colorIndex }
}])

// Default layout
const layout: NuxtPlotlyLayout = {
  histfunc: 'count',
  barmode: 'stack',
  dragmode: 'box',
  showlegend: false,
  xaxis: { title: useCTXStore().propertyNamesMap.get(prop) },
  margin: { t: 20, b: 40, l: 40, r: 20 }
}

// Default config
const config: NuxtPlotlyConfig = { scrollZoom: true, responsive: true }

// On element mount, draw the plot from provided data
onMounted(() => { $plotly.newPlot(plt.value, data.value, layout, config) })

// Watch the log scale and nbins selectors and update the plot when changed
watch([log, bins], ([tolog, tobins]) => { $plotly.restyle(plt.value, { x: computed(() => vizStore.getPropertyColumnValues(prop, tolog)), nbinsx: tobins }) })
</script>
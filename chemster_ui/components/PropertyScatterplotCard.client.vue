<template>
  <v-card class="bg-grey-lighten-3" flat density="compact">
    <v-card-item density="compact">
      <template v-slot:append>
        <v-btn icon="mdi-close" variant="plain" @click.stop="$emit('close')" density="compact" />
      </template>
    </v-card-item>
    <v-card-text>
      <div ref="plt"></div>
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col><v-switch v-model="xlog" label="Log scale x?" color="primary" hide-details :disabled="xprop.startsWith('log')" /></v-col>
          <v-col><v-switch v-model="ylog" label="Log scale y?" color="primary" hide-details :disabled="yprop.startsWith('log')" /></v-col>
          <v-spacer />
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { NuxtPlotlyConfig, NuxtPlotlyData, NuxtPlotlyHTMLElement, NuxtPlotlyLayout } from 'nuxt-plotly'
import { useCTXStore } from '~/store/ctx'
import { useVizStore } from '~/store/viz'

// Load plotly isntance
const { $plotly } = useNuxtApp()

// Load visualization data store
const vizStore = useVizStore()
const ctxStore = useCTXStore()

// Retrieve input properties (ID of property for plotting)
const props = defineProps({ 
  xprop: { type: String, required: true }, 
  yprop: { type: String, required: true }
})
const { xprop, yprop } = props

// Track state of plot
const plt: NuxtPlotlyHTMLElement = ref(null)

// Track x- and y-axis log scale selectors
const xlog = ref(false)
const ylog = ref(false)

// Reactive data for plotting
const data: Ref<NuxtPlotlyData> = ref([{
  x: vizStore.getPropertyColumnValues(xprop, false),
  y: vizStore.getPropertyColumnValues(yprop, false),
  text: vizStore.propertyTable.index,
  // Show DTXSID and coordinates on hover
  hovertemplate: '<b>%{text}</b><extra></extra><br />(%{x}, %{y})',
  type: 'scatter',
  mode: 'markers',
  marker: { color: vizStore.colorIndex }
}])

// Default layout
const layout: NuxtPlotlyLayout = {
  dragmode: 'lasso',
  showlegend: false,
  xaxis: { title: ctxStore.propertyNamesMap.get(xprop) },
  yaxis: { title: ctxStore.propertyNamesMap.get(yprop) },
  margin: { t: 20, r: 20, l: 60, b: 70 }
}

// Default config
const config: NuxtPlotlyConfig = { scrollZoom: true }

// On element mount, draw the plot from provided data
onMounted(() => { $plotly.newPlot(plt.value, data.value, layout, config) })

// Watch the log scale selectors and update the plot when changed
watch(xlog, (toxlog) => { $plotly.restyle(plt.value, { x: computed(() => vizStore.getPropertyColumnValues(xprop, toxlog)) }) })
watch(ylog, (toylog) => { $plotly.restyle(plt.value, { y: computed(() => vizStore.getPropertyColumnValues(yprop, toylog)) }) })
// Watch and react to changes to the color map
watch(storeToRefs(vizStore).colorIndex, (toColorIndex) => { $plotly.restyle(plt.value, { marker: { color: toColorIndex } }) })
</script>
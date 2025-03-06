<template>
  <v-card class="ma-2 bg-grey-lighten-3" flat>
    <v-toolbar color="secondary" :title="`${dashboardStore.getPropertyNameById(xprop)} vs. ${dashboardStore.getPropertyNameById(yprop)}`">
      <template v-slot:append>
        <v-btn icon="mdi-close" size="small" @click="$emit('close')" />
      </template>
    </v-toolbar>
    <v-card-text>
      <div ref="plt"></div>
      <v-container class="pa-0">
        <v-row class="align-center text-grey-darken-3 text-center">
          <v-col><v-switch v-model="xlog" label="Log scale x?" color="secondary" hide-details :disabled="xprop.startsWith('log')" /></v-col>
          <v-col ><v-switch v-model="ylog" label="Log scale y?" color="secondary" hide-details :disabled="yprop.startsWith('log')" /></v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { NuxtPlotlyConfig, NuxtPlotlyData, NuxtPlotlyHTMLElement, NuxtPlotlyLayout } from 'nuxt-plotly'
import { useDashboardStore } from '~/store/dashboard'
import { usePropertyStore } from '~/store/properties'

// Load plotly isntance
const { $plotly } = useNuxtApp()

// Load property data store
const propertyStore = usePropertyStore()
const dashboardStore = useDashboardStore()

// Retrieve input properties (ID of property for plotting)
const props = defineProps({ 
  xprop: { type: String, required: true }, 
  yprop: { type: String, required: true }
})
const { xprop, yprop } = props

// Track state of plot
const plt: NuxtPlotlyHTMLElement = ref(null)

const xlog = ref(false)
const ylog = ref(false)

// Reactive data for plotting
const data: Ref<NuxtPlotlyData> = ref([{
  name: 'Default',
  x: propertyStore.getPropertyValuesArrayById(xprop, false),
  y: propertyStore.getPropertyValuesArrayById(yprop, false),
  text: propertyStore.currentPropertyData.index,
  hovertemplate: '<b>%{text}</b><extra></extra><br />(%{x}, %{y})',
  type: 'scatter',
  mode: 'markers',
  marker: { color: '#424242' }
}])

// Default layout
const layout: NuxtPlotlyLayout = {
  dragmode: 'lasso',
  showlegend: true,
  margin: { l: 40, r: 20, t: 20, b: 40 }
}

// Default config
const config: NuxtPlotlyConfig = { scrollZoom: true, responsive: true }

// On element mount, draw the plot from provided data
onMounted(() => { $plotly.newPlot(plt.value, data.value, layout, config) })

// Watch the log scale selectors and update the plot when changed
watch(xlog, (toxlog) => { $plotly.restyle(plt.value, { x: computed(() => propertyStore.getPropertyValuesArrayById(xprop, toxlog)) }) })
watch(ylog, (toylog) => { $plotly.restyle(plt.value, { y: computed(() => propertyStore.getPropertyValuesArrayById(yprop, toylog)) }) })
</script>
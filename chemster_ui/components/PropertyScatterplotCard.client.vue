<template>
  <v-card class="ma-2 bg-grey-lighten-3" flat>
    <v-card-text>
      <div ref="plt"></div>
      <v-container class="pa-0">
        <v-row class="align-center text-center">
          <v-col><v-switch v-model="xlog" label="Log scale x?" color="primary" hide-details :disabled="xprop.startsWith('log')" /></v-col>
          <v-col ><v-switch v-model="ylog" label="Log scale y?" color="primary" hide-details :disabled="yprop.startsWith('log')" /></v-col>
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
  xaxis: { title: dashboardStore.getPropertyNameById(xprop) },
  yaxis: { title: dashboardStore.getPropertyNameById(yprop) },
  margin: { t: 40 }
}

// Default config
const config: NuxtPlotlyConfig = { scrollZoom: true, responsive: true }

// On element mount, draw the plot from provided data
onMounted(() => { $plotly.newPlot(plt.value, data.value, layout, config) })

// Watch the log scale selectors and update the plot when changed
watch(xlog, (toxlog) => { $plotly.restyle(plt.value, { x: computed(() => propertyStore.getPropertyValuesArrayById(xprop, toxlog)) }) })
watch(ylog, (toylog) => { $plotly.restyle(plt.value, { y: computed(() => propertyStore.getPropertyValuesArrayById(yprop, toylog)) }) })
</script>
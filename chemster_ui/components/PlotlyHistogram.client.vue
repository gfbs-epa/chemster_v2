<template>
  <nuxt-plotly
    :data="data"
    :layout="layout"
    :config="config"
    style="width: 100%"
  />
</template>

<script setup lang="ts">
import type { NuxtPlotlyConfig, NuxtPlotlyData, NuxtPlotlyLayout } from 'nuxt-plotly'

const props = defineProps({
  title: { type: String, required: true },
  x: { type: Array<number>, required: true }
})

const data: NuxtPlotlyData = [{ 
  x: props.x,
  type: 'histogram'
}]

const layout: NuxtPlotlyLayout = {
  histfunc: 'count',
  barmode: 'stack',
  dragmode: 'box',
  showlegend: true,
  title: props.title
}

const config: NuxtPlotlyConfig = { scrollZoom: true, displayModeBar: false }
</script>
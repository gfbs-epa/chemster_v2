<template>
  <v-container fluid fill-height>
    <slot name="viz" v-if="chemicalStore.chemicalsLoaded && vizStore.propertyTableLoaded"></slot>
    <LazyDataAvailabilityAlerts hydrate-on-visible require-properties v-else />
  </v-container>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useVizStore } from '~/store/viz'

const chemicalStore = useChemicalStore()
const vizStore = useVizStore()
</script>
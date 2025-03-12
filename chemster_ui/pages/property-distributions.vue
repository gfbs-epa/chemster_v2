<template>
  <v-container fluid fill-height>
    <LazyPropertyHistogramGrid hydrate-on-visible v-if="chemicalStore.chemicalsLoaded && propertyStore.propertyDataLoaded" />
    <LazyDataAvailabilityAlerts hydrate-on-visible require-properties v-else />
  </v-container>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { usePropertyStore } from '~/store/properties';

const chemicalStore = useChemicalStore()
const propertyStore = usePropertyStore()
</script>
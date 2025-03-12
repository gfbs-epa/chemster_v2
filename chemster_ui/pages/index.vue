<template>
  <v-container fluid fill-height>
    <LazyChemicalsTable hydrate-on-visible v-if="chemicalStore.chemicalsLoaded" />
    <LazyDataAvailabilityAlerts hydrate-on-visible v-else />
  </v-container>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
const chemicalStore = useChemicalStore()
</script>
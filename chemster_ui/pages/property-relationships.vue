<template>
  <v-container fluid fill-height>
    <LazyPropertyScatterplotGrid hydrate-on-visible v-if="chemicalStore.chemicalsLoaded && propertyStore.propertyDataLoaded" />
    <v-alert v-else-if="chemicalStore.chemicalsLoaded" color="grey-lighten-3" icon="$info" 
      text="No properties loaded. Open the navigation drawer and click the thermometer icon to start loading properties." />
    <UserDirectionAlerts v-else />
  </v-container>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { usePropertyStore } from '~/store/properties';

const chemicalStore = useChemicalStore()
const propertyStore = usePropertyStore()
</script>
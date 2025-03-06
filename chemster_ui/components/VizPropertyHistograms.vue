<template>
  <v-container fluid fill-height>
    <v-row no-gutters>
      <v-col cols="12" sm="6" v-for="prop in propertyStore.currentPropertyData.columns">
        <LazyVizPropertyHistogramCard :prop :key="prop" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { usePropertyStore } from '~/store/properties'
const propertyStore = usePropertyStore()
</script>
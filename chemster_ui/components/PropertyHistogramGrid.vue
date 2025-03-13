<template>
  <v-row>
    <v-col cols="12" sm="6" v-for="prop in vizStore.propertyTable.columns">
      <PropertyHistogramCard :prop :key="prop" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useVizStore } from '~/store/viz'
const vizStore = useVizStore()
</script>
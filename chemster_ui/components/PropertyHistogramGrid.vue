<template>
  <v-row>
    <v-col cols="12" sm="6" v-for="prop in propertyStore.currentPropertyData.columns">
      <LazyPropertyHistogramCard :prop :key="prop" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { usePropertyStore } from '~/store/properties'
const propertyStore = usePropertyStore()
</script>
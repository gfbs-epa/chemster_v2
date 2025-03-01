<template>
  <v-container fluid fill-height class="pa-0">
    <v-form @submit.prevent="handleSelectProperties">
      <v-autocomplete
        label="Choose Properties"
        v-model="selectProperties"
        :items="properties"
        single-line
        multiple
        chips
        clearable
        clear-on-select
      />
      <v-btn type="submit" text="Go" />
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'

onActivated(async () => { 
  if (chemicalStore.needsUpdate) {
    chemicalStore.fetchProperties()
  }
})

const chemicalStore = useChemicalStore()

const properties = Array.from(new Set(chemicalStore.storedProperties.map((p) => p.name)))
const selectProperties = ref([]) as Ref<string[]>

async function handleSelectProperties() {}
</script>
<template>
  <v-data-table :items="chemicalsStore.currentChemicals" :headers>
    <template v-slot:item.structure="{ value }">
      <v-img height="100" :src="value" />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { useChemicalsStore } from '~/store/chemicals'
import type { Chemical } from '~/utils/types'

const config = useRuntimeConfig()
const chemicalsStore = useChemicalsStore()

const headers = [
  { title: 'DTXSID', key: 'dtxsid' }, 
  { 
    title: 'Structure', 
    key: 'structure', 
    value: (item: Chemical) => `${config.public.comptoxImageUrl}/${item.dtxsid}` 
  } 
]
</script>

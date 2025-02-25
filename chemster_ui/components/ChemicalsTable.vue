<template>
  <v-data-table :items="chemicalsStore.currentChemicals" :headers>
    <template v-slot:item.structure="{ value }">
      <v-img height="100" :src="value" />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { useChemicalsStore } from '~/store/chemicals'
import type { CTXChemical } from '~/utils/types'

const config = useRuntimeConfig()
const chemicalsStore = useChemicalsStore()

const headers = [
  { title: 'DTXSID', key: 'dtxsid' },
  { title: 'DTXCID', key: 'dtxcid' },
  { title: 'Preferred Name', key: 'preferredName' },
  { title: 'Molecular Formula', key: 'molFormula' },
  { title: 'Monoisotopic Mass', key: 'monoisotopicMass' },
  { 
    title: 'Structure', 
    key: 'structure', 
    value: (item: CTXChemical) => `${config.public.comptoxImageUrl}/${item.dtxsid}`
  } 
]
</script>

<template>
  <!-- IDK why the header declaration here throws an error in VSCode...it works just fine in browser. Don't trust your IDE. -->
  <v-data-table-server
    disable-sort
    v-model:items-per-page="table.itemsPerPage"
    :items-per-page-options="[10, 25, 50, 100]"
    v-model:page="table.page"
    :headers
    :items="table.items"
    :items-length="chemicalStore.currentDtxsids.length"
    :loading="table.loading"
    item-value="dtxsid"
    @update:options="fetchChemicalTableItems"
  >
    <template v-slot:item.structure="{ value }">
      <v-img height="100" :src="value" />
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import type { CTXChemical } from '~/utils/types'

// Ensure table is updated anytime workspace/list chemicals change
const chemicalStore = useChemicalStore()
watch(storeToRefs(chemicalStore).currentDtxsids, async () => await fetchChemicalTableItems())

// Table options
const table = reactive({
  page: 1,
  itemsPerPage: 10,
  items: [] as CTXChemical[],
  loading: false
})

// Table headers and content definitions
const headers = [
  { title: 'DTXSID', key: 'dtxsid' },
  { title: 'DTXCID', key: 'dtxcid' },
  { title: 'Preferred Name', key: 'preferredName' },
  { title: 'Molecular Formula', key: 'molFormula' },
  { title: 'Monoisotopic Mass', key: 'monoisotopicMass' },
  {
    title: 'MS-Ready?', 
    key: 'msReadySmiles', 
    value: (item: CTXChemical) => !!item.msReadySmiles ? 'X' : ''
  },
  { 
    title: 'Structure', 
    key: 'structure', 
    value: (item: CTXChemical) => `${useRuntimeConfig().public.comptoxImageUrl}/${item.dtxsid}`
  } 
]

// Fetch a page of chemical details from DTXSIDs for server-side table rendering
async function fetchChemicalTableItems() {
  table.loading = true
  if (chemicalStore.chemicalsLoaded) {
    const start = (table.page - 1) * table.itemsPerPage
    const end = start + table.itemsPerPage
    const allDtxsids = chemicalStore.currentDtxsids.slice()
    const pageDtxsids = allDtxsids.slice(start, end)

    return useNuxtApp().$ctx<Array<CTXChemical>>(
      '/ctx/detail/search/by-dtxsid/?projection=ntatoolkit',
      { method: 'POST', body: pageDtxsids }
    )
    .then((resp) => {
      table.items = resp
      table.loading = false
    })
  } else {
    table.items = []
    table.loading = false
  }
}
</script>

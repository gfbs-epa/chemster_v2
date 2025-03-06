<template>
  <v-container fluid fill-height>
    <LazyChemicalsTable hydrate-on-visible v-if="chemicalStore.chemicalsLoaded" />
    <UserDirectionAlerts v-else />
  </v-container>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useDashboardStore } from '~/store/dashboard'
import { useWorkspaceStore } from '~/store/workspaces'

// Load data stores
const workspaceStore = useWorkspaceStore()
const dashboardStore = useDashboardStore()
const chemicalStore = useChemicalStore()

// On mount, fetch dashboard lists and properties from CTX APIs
// and user's existing workspaces from back-end
onMounted(async () => await Promise.all([
  dashboardStore.fetchAll(),
  workspaceStore.fetchWorkspaces()
]))
</script>
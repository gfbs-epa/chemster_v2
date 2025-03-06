<template>
  <v-main>
    <v-container fluid fill-height class="pa-0">
      <v-row no-gutters>
        <v-col>
          <v-tabs grow v-model="tab" bg-color="primary">
            <v-tab value="table" :disabled="!chemicalStore.chemicalsLoaded">Table</v-tab>
            <v-tab value="histogram" :disabled="!vizReady">Property Distributions</v-tab>
            <v-tab value="scatter" :disabled="!vizReady">Property Relationships</v-tab>
            <v-tab value="structure" disabled>Structure Visualization</v-tab>
            <v-tab value="side" disabled>Side-by-Side</v-tab>
          </v-tabs>
          <v-alert class="ma-2" v-if="!workspaceStore.workspacesAvailable" color="grey-darken-1" icon="$info" text="Looks like you haven't created any workspaces yet. Click the button at the bottom right to get started." />
          <v-alert class="ma-2" v-else-if="!workspaceStore.workspaceLoaded" color="grey-darken-1" icon="$info" text="No workspace loaded. Click the button at the bottom right to load an existing workspace or create a new one." />
          <v-alert class="ma-2" v-else-if="!setStore.setsAvailable" color="grey-darken-1" icon="$info" text="This workspace is empty. Click the button at the bottom right to add chemical sets." />
          <v-tabs-window v-else v-model="tab">
            <v-tabs-window-item key="table" value="table">
              <!-- First tab in viewport, so don't make this lazy -->
              <ChemicalsTable />
            </v-tabs-window-item>
            <v-tabs-window-item key="histogram" value="histogram" hydrate-on-visible>
              <LazyVizPropertyHistograms v-if="vizReady" />
              <v-alert v-else class="ma-2" color="grey-darken-1" icon="$info" text="No property data available. Click the button at the bottom right to load properties." />
            </v-tabs-window-item>
            <v-tabs-window-item key="scatter" value="scatter" hydrate-on-visible>
              <LazyVizPropertyScatterplots v-if="vizReady" />
              <v-alert v-else class="ma-2" color="grey-darken-1" icon="$info" text="No property data available. Click the button at the bottom right to load properties." />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <!-- An admittedly hacky spacing solution -->
        </v-col>
      </v-row>
      <ManageMenu />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useDashboardStore } from '~/store/dashboard'
import { useSetStore } from '~/store/sets'
import { usePropertyStore } from '~/store/properties'
import { useWorkspaceStore } from '~/store/workspaces'
import { UI_LOGIN_ENDPOINT } from '~/utils/constants'
import { useChemicalStore } from '~/store/chemicals'

// Check authentication and redirect to login if not
// Note useAuthStore must be initialized directly in callback here or it will be undefined due to import order
definePageMeta({ middleware: [() => { if (!useAuthStore().authenticated) { return navigateTo(UI_LOGIN_ENDPOINT) } }] })

// Load data stores
const workspaceStore = useWorkspaceStore()
const dashboardStore = useDashboardStore()
const setStore = useSetStore()
const propertyStore = usePropertyStore()
const chemicalStore = useChemicalStore()

// On mount, fetch dashboard lists and properties from CTX APIs
// and user's existing workspaces from back-end
onMounted(async () => await Promise.all([
  dashboardStore.fetchAll(),
  workspaceStore.fetchWorkspaces()
]))

// Track active tab
const tab = ref('table')
// Enable visualization tabs once properties and chemicals are available
const vizReady = computed(() => chemicalStore.chemicalsLoaded && propertyStore.propertyDataLoaded)
</script>
<template>
  <v-main>
    <v-container fluid fill-height class="pa-0">
      <v-row no-gutters>
        <v-col>
          <v-tabs grow v-model="tab" bg-color="primary">
            <v-tab value="table">Table</v-tab>
            <v-tab value="histogram">Property Distributions</v-tab>
            <v-tab value="scatter" disabled>Property Relationships</v-tab>
            <v-tab value="structure" disabled>Structure Visualization</v-tab>
            <v-tab value="side-by-side" disabled>Side-by-Side</v-tab>
          </v-tabs>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item key="table" value="table">
              <ChemicalsTable />
            </v-tabs-window-item>
            <v-tabs-window-item key="histogram" value="histogram">
              <HistogramBlocks />
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
import { useWorkspaceStore } from '~/store/workspaces'
import { UI_LOGIN_ENDPOINT } from '~/utils/constants'

const workspaceStore = useWorkspaceStore()
const dashboardStore = useDashboardStore()

// Check authentication and redirect to login if not
// Note useAuthStore must be called directly here or it will be udnefined due to import order
definePageMeta({ middleware: [() => { if (!useAuthStore().authenticated) { return navigateTo(UI_LOGIN_ENDPOINT) } }] })

// On mount, fetch all user workspaces and dashboard lists from database
onMounted(async () => { 
  await Promise.all([
    workspaceStore.fetchWorkspaces(),
    dashboardStore.fetchDashboardLists()
  ])
})

// Track active tab
const tab = ref('table')
</script>
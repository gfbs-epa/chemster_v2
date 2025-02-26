<template>
  <v-main>
    <v-container fluid fill-height class="pa-0">
      <v-tabs fixed-tabs center-active v-model="tab" bg-color="primary">
        <v-tab value="table">Table</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item key="table" value="table">
          <v-sheet>
            <ChemicalsTable />
          </v-sheet>
        </v-tabs-window-item>
      </v-tabs-window>
      <ToolsMenu />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useWorkspaceStore } from '~/store/workspaces'
import { UI_LOGIN_ENDPOINT } from '~/utils/constants'

const workspaceStore = useWorkspaceStore()

// Check authentication and redirect to login if not
// Note useAuthStore must be called directly here or it will be udnefined due to import order
definePageMeta({ middleware: [() => { if (!useAuthStore().authenticated) { return navigateTo(UI_LOGIN_ENDPOINT) } }] })

// On mount, fetch all user workspaces from database
onMounted(async () => { await workspaceStore.fetchWorkspaces() })

// Track active tab
const tab = ref('table')
</script>
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
import { useCollectionsStore } from '~/store/collections'
import { UI_LOGIN_ENDPOINT } from '~/utils/constants'

const collectionsStore = useCollectionsStore()

// Check authentication and redirect to login if not
definePageMeta({ middleware: [() => { if (!useAuthStore().authenticated) { return navigateTo(UI_LOGIN_ENDPOINT) } }] })

// On mount, fetch all user workspaces from database
onMounted(async () => { await collectionsStore.fetchWorkspaces() })

// Track active tab
const tab = ref('table')
</script>
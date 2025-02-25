<template>
  <CollectionsDrawer />
  <v-main>
    <v-container fluid>
      <v-tabs v-model="tab" bg-color="primary">
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
import { UI_LOGIN_ENDPOINT } from '~/utils/constants'

// Check authentication and redirect to login if not
definePageMeta({ middleware: [() => { if (!useAuthStore().authenticated) { return navigateTo(UI_LOGIN_ENDPOINT) } }] })

// Track active tab
const tab = ref('table')
</script>
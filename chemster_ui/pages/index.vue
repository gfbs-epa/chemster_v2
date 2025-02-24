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
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

// Check authentication and redirect to login if not
definePageMeta({ middleware: [() => { if (!useAuthStore().authenticated) { return navigateTo('/login') } }] })

// Track active tab
const tab = ref('table')
</script>
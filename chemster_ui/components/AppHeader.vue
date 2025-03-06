<template>
  <v-app-bar color="primary" flat>
    <v-app-bar-title>ChemSTER: Chemical Space To Explorable Representations</v-app-bar-title>
    <template v-slot:append v-if="authStore.authenticated">
      <v-btn icon @click="handleLogout" class="ma-2">
        <v-icon>mdi-logout</v-icon>
        <v-tooltip activator="parent" location="start" text="Logout" />
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useChemicalStore } from '~/store/chemicals'
import { useDashboardStore } from '~/store/dashboard'
import { useSetStore } from '~/store/sets'
import { usePropertyStore } from '~/store/properties'
import { useWorkspaceStore } from '~/store/workspaces'

// Load auth store to do logout API call
const authStore = useAuthStore()
// Also load the current data stores so they can be reset on logout
const stores = [
  useWorkspaceStore(),
  useSetStore(),
  useChemicalStore(),
  usePropertyStore(),
  useDashboardStore()
]

async function handleLogout() {
  stores.forEach((store) => store.reset())
  return await authStore.logout()
}
</script>
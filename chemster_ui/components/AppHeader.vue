<template>
  <v-app-bar color="primary" flat>
    <template v-slot:prepend v-if="authStore.authenticated">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="ma-2" />
    </template>
    <v-app-bar-title>ChemSTER: Chemical Space To Explorable Representations</v-app-bar-title>
    <v-spacer />
    <v-btn icon @click="handleLogout" class="ma-2" v-if="authStore.authenticated">
      <v-icon>mdi-logout</v-icon>
      <v-tooltip activator="parent" location="bottom" text="Logout" />
    </v-btn>
  </v-app-bar>
  <LazyAppDrawer hydrate-on-visible v-if="authStore.authenticated" v-model="drawer" />
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
// Set up the current data stores so they can be reset on logout
const stores = [
  useWorkspaceStore(),
  useSetStore(),
  useChemicalStore(),
  usePropertyStore(),
  useDashboardStore()
]

// Open/close navigation drawer
const drawer = ref(false)

// User logout
async function handleLogout() {
  drawer.value = false
  stores.forEach((store) => store.reset())
  return await authStore.logout()
}
</script>
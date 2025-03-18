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
import { useCTXStore } from '~/store/ctx'
import { useSetStore } from '~/store/sets'
import { useVizStore } from '~/store/viz'
import { useWorkspaceStore } from '~/store/workspaces'

// Load auth store to do logout API call
const authStore = useAuthStore()
// Load all current data stores so they can be reset on logout
const stores = [
  useWorkspaceStore(),
  useSetStore(),
  useChemicalStore(),
  useVizStore(),
  useCTXStore()
]

// Open/close navigation drawer
const drawer = ref(true)

// Check drawer is always opened on login and closed on logout
watch(storeToRefs(authStore).authenticated, (to) => drawer.value = to)

// Reset all stored data, make back-end logout calls, and redirect to /login
async function handleLogout() {
  stores.forEach((store) => store.reset())
  return await authStore.logout()
}
</script>
<template>
  <v-app>
    <AppHeader />
    <v-main>
      <NuxtPage />
    </v-main>
    <LazyAppFooter hydrate-on-visible v-if="authStore.authenticated" />
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useCTXStore } from './store/ctx'
import { useWorkspaceStore } from './store/workspaces'

// Load the user data store to display footer if logged in
const authStore = useAuthStore()

// Initialize store data on login
watch(storeToRefs(authStore).authenticated, async (to) => {
  if (to) {
    await initStores()
  }
})

// Ensure store data is always reloaded on refresh
// while user is logged in
onMounted(async () => {
  if (authStore.authenticated) {
    await initStores()
  }
})

// Helper to collect all initialization functions
async function initStores() {
  return Promise.all([
    useCTXStore().fetchAll(),
    useWorkspaceStore().fetchWorkspaces()
  ])
}
</script>

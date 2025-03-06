<template>
  <ChemicalsTable />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useDashboardStore } from '~/store/dashboard'
import { useWorkspaceStore } from '~/store/workspaces'
import { UI_LOGIN_ENDPOINT } from '~/utils/constants'

// Check authentication and redirect to login if not
// Note useAuthStore must be initialized directly in callback here or it will be undefined due to import order
definePageMeta({ middleware: [() => { if (!useAuthStore().authenticated) { return navigateTo(UI_LOGIN_ENDPOINT) } }] })

// Load data stores
const workspaceStore = useWorkspaceStore()
const dashboardStore = useDashboardStore()

// On mount, fetch dashboard lists and properties from CTX APIs
// and user's existing workspaces from back-end
onMounted(async () => await Promise.all([
  dashboardStore.fetchAll(),
  workspaceStore.fetchWorkspaces()
]))
</script>
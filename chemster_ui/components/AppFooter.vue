<template>
  <v-footer app color="grey-lighten-3">
    <v-chip v-if="authStore.authenticated" prepend-icon="mdi-account" class="mr-1" density="comfortable" size="small" variant="flat">
      {{ authStore.currentUsername }}
    </v-chip>
    <v-chip v-if="authStore.authenticated && workspaceStore.workspaceLoaded" prepend-icon="mdi-folder" class="mx-1" density="comfortable" size="small" variant="flat">
      {{ workspaceStore.currentWorkspaceName }}
    </v-chip>
    <LazySetColorChip v-for="id in setStore.currentSetIds" :id />
  </v-footer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useSetStore } from '~/store/sets'
import { useWorkspaceStore } from '~/store/workspaces'

// Load user and data stores to display footer info if logged in
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
const setStore = useSetStore()
</script>
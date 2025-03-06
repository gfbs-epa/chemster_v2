<template>
  <v-footer app color="primary">
    <div v-if="authStore.authenticated">
      <strong>User:</strong> {{ authStore.currentUsername }}
      <span v-if="workspaceStore.workspaceLoaded">/ <strong>Workspace:</strong> {{ workspaceStore.currentWorkspaceName }}</span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useWorkspaceStore } from '~/store/workspaces'

// Load the user and workspace stores to display footer info if logged in
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
</script>
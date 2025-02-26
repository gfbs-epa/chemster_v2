<template>
  <v-footer app color="primary">
    <div v-if="authStore.authenticated">
      <strong>User:</strong> {{ authStore.currentUsername }}
      <span v-if="workspaceStore.currentWorkspaceId">/ <strong>Workspace:</strong> {{ workspaceStore.currentWorkspaceName }}</span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useWorkspaceStore } from '~/store/workspaces'

const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
</script>
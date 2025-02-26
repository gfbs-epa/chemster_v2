<template>
  <v-footer app color="primary">
    <div v-if="authStore.authenticated">
      <strong>User:</strong> {{ authStore.currentUsername }}
      <span v-if="collectionsStore.currentWorkspaceName != ''">/ <strong>Workspace:</strong> {{ collectionsStore.currentWorkspaceName }}</span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth';
import { useCollectionsStore } from '~/store/collections'

const collectionsStore = useCollectionsStore()
const authStore = useAuthStore()
</script>
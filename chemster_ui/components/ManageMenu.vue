<template>
  <v-fab app color='light-green-darken-4' size="x-large" icon>
    <v-icon>{{ open ? 'mdi-close' : 'mdi-periodic-table' }}</v-icon>
    <v-speed-dial v-model="open" location="left center" transition="slide-x-reverse-transition" activator="parent">
      <v-btn v-if="true" color='light-green-darken-2' size="x-large" icon>
        <v-icon>mdi-file-cabinet</v-icon>
        <v-tooltip activator="parent" location="top" text="Manage Workspace" />
        <WorkspaceManageDialog />
      </v-btn>
      <v-btn v-if="!!workspaceStore.currentWorkspaceId" color='light-green-darken-1' size="x-large" icon>
        <v-icon>mdi-beaker-outline</v-icon>
        <v-tooltip activator="parent" location="top" text="Manage Lists" />
        <ListManageDialog />
      </v-btn>
    </v-speed-dial>
  </v-fab>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/store/workspaces'

const workspaceStore = useWorkspaceStore()

// Track open/closed FAB
const open = ref(false)
</script>
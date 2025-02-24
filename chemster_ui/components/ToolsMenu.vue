<template>
  <v-fab app :color="fabOpen ? '' : 'primary'" location="right bottom" size="large" icon>
    <v-icon>{{ fabOpen ? 'mdi-close' : 'mdi-tools' }}</v-icon>
    <v-speed-dial v-model="fabOpen" location="top center" transition="slide-y-reverse-transition" activator="parent">
      <v-btn v-if="true" color="primary" size="large" icon>
        <v-icon>mdi-plus</v-icon>
        <v-tooltip activator="parent" location="start" text="Create Workspace" />
      </v-btn>
      <v-btn v-if="collectionsStore.workspaces.length > 0" color="primary" size="large" icon>
        <v-icon>mdi-swap-horizontal</v-icon>
        <v-tooltip activator="parent" location="start" text="Switch Workspace" />
      </v-btn>
      <v-btn v-if="!!collectionsStore.currentWorkspaceId" color="primary" size="large" icon>
        <v-icon>mdi-note-plus</v-icon>
        <v-tooltip activator="parent" location="start" text="Add Lists" />
      </v-btn>
      <v-btn v-if="collectionsStore.workspaceLists.length > 0" color="primary" size="large" icon>
        <v-icon>mdi-note-text</v-icon>
        <v-tooltip activator="parent" location="start" text="Select Lists" />
      </v-btn>
    </v-speed-dial>
  </v-fab>
</template>

<script setup lang="ts">
import { useCollectionsStore } from '~/store/collections'

const collectionsStore = useCollectionsStore()

// Track open/closed FAB
const fabOpen = ref(false)
</script>
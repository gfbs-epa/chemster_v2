<template>
  <v-fab app color='light-green-darken-4' size="x-large" icon>
    <v-icon>{{ fabOpen ? 'mdi-close' : 'mdi-flask-outline' }}</v-icon>
    <v-speed-dial v-model="fabOpen" location="left center" transition="slide-x-reverse-transition" activator="parent">
      <v-btn v-if="true" color='light-green-darken-3' size="x-large" icon>
        <v-icon>mdi-book-multiple-outline</v-icon>
        <v-tooltip activator="parent" location="top" text="Manage Workspaces" />
        <WorkspaceManageDialog />
      </v-btn>
      <v-btn v-if="!!workspaceStore.currentWorkspaceId" color='light-green-darken-2' size="x-large" icon>
        <v-icon>mdi-plus</v-icon>
        <v-tooltip activator="parent" location="top" text="Add Lists" />
      </v-btn>
      <!--
      <v-btn v-if="workspaceStore.workspaceLists.length > 0" color='light-green-darken-1' size="x-large" icon>
        <v-icon>mdi-filter-variant</v-icon>
        <v-tooltip activator="parent" location="top" text="Select Lists" />
      </v-btn>
      -->
    </v-speed-dial>
  </v-fab>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/store/workspaces'

const workspaceStore = useWorkspaceStore()

// Track open/closed FAB
const fabOpen = ref(false)
</script>
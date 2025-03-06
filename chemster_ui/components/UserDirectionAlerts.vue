<template>
  <v-alert v-if="!workspaceStore.workspacesAvailable" color="grey-lighten-3" icon="$info" 
    text="No workspaces available. Open the navigation drawer and click the folder icon to get started." />
  <v-alert v-else-if="!workspaceStore.workspaceLoaded" color="grey-lighten-3" icon="$info" 
    text="No workspace loaded. Open the navigation drawer and click the folder icon to load an existing workspace or create a new one." />
  <v-alert v-else-if="!setStore.setsAvailable" color="grey-lighten-3" icon="$info" 
    text="No chemical sets available. Open the navigation drawer and click the flask icon to start adding sets." />
</template>

<script setup lang="ts">
import { useSetStore } from '~/store/sets'
import { useWorkspaceStore } from '~/store/workspaces'

const workspaceStore = useWorkspaceStore()
const setStore = useSetStore()
</script>
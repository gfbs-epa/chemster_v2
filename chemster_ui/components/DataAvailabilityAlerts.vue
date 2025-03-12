<template>
  <v-alert v-if="!workspaceStore.workspacesAvailable" color="grey-lighten-3" icon="$info" 
    text="No workspaces available. Click the folder icon in the navigation panel to get started." />
  <v-alert v-else-if="!workspaceStore.workspaceLoaded" color="grey-lighten-3" icon="$info" 
    text="No workspace loaded. Click the folder icon in the navigation panel to load an existing workspace or create a new one." />
  <v-alert v-else-if="!setStore.setsAvailable" color="grey-lighten-3" icon="$info" 
    text="No chemical sets available. Click the flask icon in the navigation panel to start adding sets." />
  <v-alert v-else-if="props.requireProperties && !propertyStore.propertyDataLoaded" color="grey-lighten-3" icon="$info" 
    text="No properties loaded. Click the thermometer icon in the navigation panel to start loading properties." />
</template>

<script setup lang="ts">
import { usePropertyStore } from '~/store/properties'
import { useSetStore } from '~/store/sets'
import { useWorkspaceStore } from '~/store/workspaces'

const workspaceStore = useWorkspaceStore()
const setStore = useSetStore()
const propertyStore = usePropertyStore()

const props = defineProps({ requireProperties: { type: Boolean, required: false } })
</script>
<template>
  <v-fab app location="right bottom" color='light-green-darken-4' size="x-large" icon>
    <v-icon>{{ open ? 'mdi-close' : 'mdi-periodic-table' }}</v-icon>
    <v-speed-dial hydrate-on-visible v-model="open" location="left center" activator="parent" transition="slide-x-reverse-transition">
      <v-btn v-if="open" color='light-green-darken-2' size="x-large" icon>
        <v-icon>mdi-file-cabinet</v-icon>
        <v-tooltip activator="parent" location="top" text="Manage Workspace" />
        <LazyManageWorkspaceDialog hydrate-on-visible />
      </v-btn>
      <v-btn v-if="workspaceStore.workspaceLoaded" color='light-green-darken-1' size="x-large" icon>
        <v-icon>mdi-beaker-outline</v-icon>
        <v-tooltip activator="parent" location="top" text="Manage Sets" />
        <LazyManageSetDialog hydrate-on-visible />
      </v-btn>
      <v-btn v-if="chemicalStore.chemicalsLoaded" color='secondary' size="x-large" icon>
        <v-icon>mdi-thermometer-lines</v-icon>
        <v-tooltip activator="parent" location="top" text="Manage Properties" />
        <LazyManagePropertyDialog hydrate-on-visible />
      </v-btn>
    </v-speed-dial>
  </v-fab>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useWorkspaceStore } from '~/store/workspaces'

const workspaceStore = useWorkspaceStore()
const chemicalStore = useChemicalStore()

// Track open/closed menu state
const open = ref(false)
</script>
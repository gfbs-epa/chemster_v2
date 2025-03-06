<template>
  <v-navigation-drawer floating color="grey-lighten-3">
    <v-list nav>
      <v-list-item nuxt to="/" title="Data Table" prepend-icon="mdi-table-large" />
      <v-list-item nuxt to="/property-distributions" title="Property Distributions" prepend-icon="mdi-chart-bar" />
      <v-list-item nuxt to="/property-relationships" title="Property Relationships" prepend-icon="mdi-chart-scatter-plot" />
    </v-list>
    <v-divider />
    <div class="pa-5 text-center">
      <p class="font-italic">
        More info'n'stuff goes here
      </p>
    </div>
    <v-divider />
    <div class="text-center">
      <v-btn icon class="mx-2" variant="plain">
        <v-icon>mdi-folder</v-icon>
        <LazyManageWorkspaceDialog hydrate-on-visible />
      </v-btn>
      <v-btn :disabled="!workspaceStore.workspaceLoaded" icon variant="plain" class="mx-2">
        <v-icon>mdi-flask-empty</v-icon>
        <LazyManageSetDialog hydrate-on-visible />
      </v-btn>
      <v-btn :disabled="!chemicalStore.chemicalsLoaded" icon variant="plain" class="mx-2">
        <v-icon>mdi-thermometer</v-icon>
        <LazyManagePropertyDialog hydrate-on-visible />
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useWorkspaceStore } from '~/store/workspaces'

const workspaceStore = useWorkspaceStore()
const chemicalStore = useChemicalStore()
</script>
<template>
    <v-navigation-drawer permanent>
      <v-expansion-panels v-model="panel" variant="accordion" color="primary" rounded="0" flat>
        <v-expansion-panel title="Workspace" value="workspace">
          <v-expansion-panel-text>
            <v-form @submit.prevent="handleUpdateWorkspace">
              <v-select
                label="Choose a Workspace"
                v-model="workspaceId"
                :items="collectionsStore.workspaces" 
                item-title="name" 
                item-value="id"
                single-line
              />
              <v-btn color="primary" type="submit" :disabled="!workspaceId" text="Set Workspace" />
            </v-form>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Existing Lists" :disabled="collectionsStore.workspaceLists.length == 0" value="existingLists">
          <v-expansion-panel-text>
            <v-form @submit.prevent="handleUpdateLists">
                <v-select 
                  label="Choose Lists"
                  v-model="existingListIds"
                  :items="collectionsStore.workspaceLists" 
                  item-title="name" 
                  item-value="id" 
                  hint="Leave blank to use entire workspace"
                  single-line
                  persistent-hint
                  multiple
                  chips
                />
                <v-btn color="primary" type="submit" text="Set Lists" />
            </v-form>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useCollectionsStore } from '~/store/collections'
import { useChemicalsStore } from '~/store/chemicals'

// On mount, fetch all user workspaces from database
onMounted(async () => { await collectionsStore.fetchWorkspaces() })

// Load collection and chemical data stores
const collectionsStore = useCollectionsStore()
const chemicalsStore = useChemicalsStore()

// Track state of workspace and list selectors
const workspaceId = ref()
const existingListIds = ref([])
// Track open panel
const panel = ref('workspace')

// On button click, save selected workspace and fetch chemicals
async function handleUpdateWorkspace() { 
  await collectionsStore.updateWorkspace(workspaceId.value)
  await fetchAllWorkspaceChemicals()
  // Clear existing list selections to avoid conflict
  existingListIds.value = []
  // Jump to existing lists panel
  panel.value = "existingLists"
}

// On button click, save selected lists and fetch chemicals
async function handleUpdateLists() {
  collectionsStore.currentListIds = existingListIds.value
  if (existingListIds.value.length > 0) {
    await chemicalsStore.fetchChemicals(collectionsStore.currentListIds, false)
  } else {
    await fetchAllWorkspaceChemicals()
  }
}

// Helper to update chemicals when entire workspace is used
async function fetchAllWorkspaceChemicals() {
  await chemicalsStore.fetchChemicals([collectionsStore.currentWorkspaceId], true)
}
</script>

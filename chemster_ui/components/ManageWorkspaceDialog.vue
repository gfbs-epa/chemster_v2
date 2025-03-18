<template>
  <v-dialog activator="parent" v-model="open" max-width="800">
    <v-card>
      <v-toolbar title="Manage Workspaces" color="primary">
        <template v-slot:extension>
          <v-tabs grow v-model="tab">
            <v-tab value="select" :disabled="!workspaceStore.workspacesAvailable">Select Workspace</v-tab>
            <v-tab value="create">Create Workspace</v-tab>
            <v-tab value="delete" :disabled="!workspaceStore.workspacesAvailable">Delete Workspace</v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item key="select" value="select">
            <v-form @submit.prevent="handleSelectWorkspace">
              <v-autocomplete
                label="Choose a Workspace"
                v-model="input.select"
                :items="workspaceStore.workspaces"
                item-title="name"
                item-value="id"
                class="my-2"
                single-line
              />
              <v-btn color="primary" 
                type="submit" 
                :disabled="!input.select || input.select == workspaceStore.currentWorkspaceId" 
                text="Select" 
              />
            </v-form>
          </v-tabs-window-item>
          <v-tabs-window-item key="create" value="create">
            <v-form @submit.prevent="handleCreateWorkspace" v-model="validWorkspaceName" validate-on="input">
              <v-text-field v-model="input.create" label="" :rules="workspaceNameRules" class="my-2" required />
              <v-btn text="Create" color="primary" type="submit" :disabled="!validWorkspaceName"/>
            </v-form>
            <v-alert v-if="failures.create" text="Workspace creation failed. Please try again." icon="$error" color="error" class="mt-2" />
          </v-tabs-window-item>
          <v-tabs-window-item key="delete" value="delete">
            <v-form @submit.prevent="handleDeleteWorkspace">
              <v-autocomplete
                label="Choose a Workspace"
                v-model="input.delete"
                :items="workspaceStore.workspaces"
                item-title="name"
                item-value="id"
                class="my-2"
                single-line
              />
              <v-btn color="primary" type="submit" :disabled="!input.delete" text="Delete" />
            </v-form>
            <v-alert v-if="failures.delete" text="Workspace deletion failed. Please try again." icon="$error" color="error" class="mt-2" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useVizStore } from '~/store/viz'
import { useSetStore } from '~/store/sets'
import { useWorkspaceStore } from '~/store/workspaces'
import { required, minChars, maxChars, alphaFirst, safeChars } from '~/utils/validation-rules'

// Load stored collection and chemical data for session
const workspaceStore = useWorkspaceStore()
const setStore = useSetStore()
const chemicalStore = useChemicalStore()
const vizStore = useVizStore()

// Track open/closed state of dialog and tabs
const open = ref(false)
const tab = ref(workspaceStore.workspacesAvailable ? 'select' : 'create')

// Track failures from API calls
const failures = reactive({ create: false, delete: false })

// Track user inputs
const input = reactive({
  select: null as number | null,
  create: '',
  delete: null as number | null,
})

// Watch for dialog close and set all inputs to default
watch(open, () => {
  tab.value = workspaceStore.workspacesAvailable ? 'select' : 'create'
  failures.create = false
  failures.delete = false                              
  input.select = workspaceStore.currentWorkspaceId
  input.create = ''
  input.delete = null
})                        

// Track inputs and validation for workspace creation
const validWorkspaceName = ref(false)
const workspaceNameRules = [required(), minChars(3), maxChars(32), alphaFirst(), safeChars()]

// Handle submission of created workspace to back-end
async function handleCreateWorkspace() {
  // Submit the new workspace and set it as current
  await workspaceStore.createAndLoadWorkspace(input.create)
  .then(() => {
    // New workspace is always empty, so reset everything
    setStore.reset()
    chemicalStore.reset()
    vizStore.reset()
    open.value = false
  })
  .catch(() => failures.create = true)
  .finally(() => input.create = '')
}

// Handle workspace selection
async function handleSelectWorkspace() {
  // Update stored collection data
  workspaceStore.currentWorkspaceId = input.select
  // Close dialog
  open.value = false
  // Start with all lists and chemicals for workspace
  await setStore.fetchSets(workspaceStore.currentWorkspaceId)
  .then(async () => {
    vizStore.reset()
    if (setStore.setsLoaded) {
      chemicalStore.fetchChemicals(setStore.currentSetIds)
    } else {
      chemicalStore.reset()
    }
  })
}

// Handle submission of workspace deletion to back-end
async function handleDeleteWorkspace() {
  await workspaceStore.deleteWorkspace(input.delete)
  .catch(() => failures.delete = true)
  .then(() => {
    // If we just deleted the current workspace, reset everything
    if (workspaceStore.currentWorkspaceId == null) {
      setStore.reset()
      chemicalStore.reset()
      vizStore.reset()
    }
    // Otherwise nothing in the current interface changes
    // Then close the dialog
    open.value = false
  })
}
</script>
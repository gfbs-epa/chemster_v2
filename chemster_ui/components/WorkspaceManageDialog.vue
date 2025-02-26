<template>
  <v-dialog activator="parent" v-model="open" transition="dialog-bottom-transition" max-width="800">
    <v-card>
      <v-tabs fixed-tabs center-active v-model="tab" bg-color="primary">
        <v-tab value="select" :disabled="!collectionsStore.workspacesAvailable">Select Workspace</v-tab>
        <v-tab value="create">Create Workspace</v-tab>
        <v-tab value="delete" :disabled="!collectionsStore.workspacesAvailable">Delete Workspace</v-tab>
      </v-tabs>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="select">
            <v-form @submit.prevent="handleSelectWorkspace">
              <v-select
                label="Choose a Workspace"
                v-model="selectWorkspaceId"
                :items="collectionsStore.workspaces"
                item-title="name"
                item-value="id"
                single-line
              />
              <v-btn color="primary" 
                type="submit" 
                :disabled="!selectWorkspaceId || selectWorkspaceId == collectionsStore.currentWorkspaceId" 
                text="Select" 
              />
            </v-form>
          </v-tabs-window-item>
          <v-tabs-window-item value="create">
            <v-form @submit.prevent="handleCreateWorkspace" v-model="validWorkspaceName" validate-on="input">
              <v-text-field v-model="createWorkspaceName" label="" :rules="createWorkspaceNameRules" class="my-2" required />
              <v-btn text="Create" color="primary" type="submit" :disabled="!validWorkspaceName"/>
            </v-form>
            <v-alert v-if="creationFailed" text="Workspace creation failed. Please try again." icon="$error" color="error" class="mt-2" />
          </v-tabs-window-item>
          <v-tabs-window-item value="delete">
            <v-form @submit.prevent="handleDeleteWorkspace">
              <v-select
                label="Choose a Workspace"
                v-model="deleteWorkspaceId"
                :items="collectionsStore.workspaces"
                item-title="name"
                item-value="id"
                single-line
              />
              <v-btn color="primary" type="submit" :disabled="!deleteWorkspaceId" text="Delete" />
            </v-form>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useChemicalsStore } from '~/store/chemicals'
import { useCollectionsStore } from '~/store/collections'

// Load stored collection and chemical data for session
const collectionsStore = useCollectionsStore()
const chemicalsStore = useChemicalsStore()

// Track open/closed state of dialog and tabs
const open = ref(false)
const tab = ref(collectionsStore.workspacesAvailable ? 'select' : 'create')

// Track inputs and validation for workspace creation
const validWorkspaceName = ref(false)
const createWorkspaceName = ref('')
const createWorkspaceNameRules = [ 
  (w: string) => !!w || 'Required',
  (w: string) => /^[A-Za-z]+.*$/.test(w) || 'First character must be a letter',
  (w: string) => w.length >= 3 || 'At least 3 characters required',
  (w: string) => /^[\w\. ]+$/.test(w) || 'Only letters, numbers, _, ., and space allowed',
  (w: string) => w.length <= 32 || 'Limit 32 characters'
]
const creationFailed = ref(false)

// Handle submission of created workspace to back-end
async function handleCreateWorkspace() {
  // Submit the new workspace
  await collectionsStore.createWorkspace(createWorkspaceName.value)
    .then(async () => {
      // Reset available chemicals
      chemicalsStore.reset()
      // Update select field contents
      selectWorkspaceId.value = collectionsStore.currentWorkspaceId
      // Close dialog without failure alert
      creationFailed.value = false
      open.value = false
    })
    .catch(() => 
      // Trigger failure alert and leave dialog open
      creationFailed.value = true
    )
    .finally(() => {
      // Reset workspace creation field
      createWorkspaceName.value = ''
    })
}

// Handle workspace selection
const selectWorkspaceId = ref()
async function handleSelectWorkspace() {
  // Update stored collection data
  collectionsStore.currentWorkspaceId = selectWorkspaceId.value
  // Close dialog
  open.value = false
  // Update the available lists and chemicals in the selected workspace
  await Promise.all([collectionsStore.fetchWorkspaceLists(), chemicalsStore.fetchChemicals([collectionsStore.currentWorkspaceId], true)])
}

// Handle submission of workspace deletion to back-end
const deleteWorkspaceId = ref()
async function handleDeleteWorkspace() {
  // Delete the workspace
  await collectionsStore.deleteWorkspace(deleteWorkspaceId.value)
    .finally(() => {
      // Reset contents of select and delete fields
      selectWorkspaceId.value = collectionsStore.currentWorkspaceId
      deleteWorkspaceId.value = null
      // Close the dialog
      open.value = false
    })
}
</script>
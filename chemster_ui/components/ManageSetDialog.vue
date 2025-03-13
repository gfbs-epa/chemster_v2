<template>
  <v-dialog activator="parent" v-model="open" max-width="800">
    <v-card>
      <v-toolbar title="Manage Sets" :color="COLOR">
        <template v-slot:extension>
          <v-tabs grow v-model="dialog.tab">
            <v-tab value="select" :disabled="!setStore.setsAvailable">Select Sets</v-tab>
            <v-tab value="add">Add Set From Dashboard List</v-tab>
            <v-tab value="custom" disabled>Add Custom Set</v-tab>
            <v-tab value="delete" :disabled="!setStore.setsAvailable">Delete Set</v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-card-text>
        <v-tabs-window v-model="dialog.tab">
          <v-tabs-window-item key="select" value="select">
            <v-form @submit.prevent="handleSelectSets">
              <v-autocomplete
                label="Choose Sets"
                v-model="input.select"
                :items="setStore.sets"
                item-title="name"
                item-value="id"
                class="my-2"
                single-line
                multiple
                chips
                clearable
                clear-on-select
              />
              <v-btn :color="COLOR" type="submit" text="Select" :disabled="input.select.length === 0" />
            </v-form>
          </v-tabs-window-item>
          <v-tabs-window-item key="add" value="add">
            <v-form @submit.prevent="handleAddDashboardLists">
              <div>
                Select the <a href="https://www.nature.com/articles/s41597-022-01365-8" target="_blank" rel="noopener noreferrer">Multimedia Monitoring Database</a> harmonized media appropriate to your chemical space:
              </div>
              <v-autocomplete
                label="MMDB Harmonized Media Lists"
                v-model="input.addMedia"
                :items="ctxStore.lists.media"
                item-title="title"
                item-value="value"
                multiple 
                chips
                clearable
                clear-on-select
                class="my-2"
              />
              <div>
                Select other <a href="https://comptox.epa.gov/dashboard/chemical-lists" target="_blank" rel="noopener noreferrer">CompTox Chemicals Dashboard</a> lists to further describe your chemical space:
              </div>
              <v-autocomplete
                label="Other Chemical Lists"
                v-model="input.addOther"
                :items="ctxStore.lists.other"
                item-title="title"
                item-value="value"
                class="my-2"
                multiple
                chips
                clearable
                clear-on-select
              />
              <v-btn :color="COLOR" type="submit" text="Add" :loading="dialog.loading"
                :disabled="dialog.loading || (input.addMedia.length + input.addOther.length === 0)" />
            </v-form>
            <v-alert v-if="failures.add" text="List addition failed. Please try again." icon="$error" color="error" class="mt-2" />
          </v-tabs-window-item>
          <v-tabs-window-item key="delete" value="delete">
            <v-form @submit.prevent="handleDeleteSet">
              <v-autocomplete
                label="Choose a Set"
                v-model="input.delete"
                :items="setStore.sets"
                item-title="name"
                item-value="id"
                class="my-2"
                single-line
              />
              <v-btn :color="COLOR" type="submit" :disabled="!input.delete" text="Delete" />
            </v-form>
            <v-alert v-if="failures.delete" text="List deletion failed. Please try again." icon="$error" color="error" class="mt-2" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useCTXStore } from '~/store/ctx'
import { useSetStore } from '~/store/sets'
import { useWorkspaceStore } from '~/store/workspaces'

const COLOR = 'primary'

// Load stored collection and chemical data for session
const ctxStore = useCTXStore()
const workspaceStore = useWorkspaceStore()
const setStore = useSetStore()
const chemicalStore = useChemicalStore()

// Track open/closed dialog
const open = ref(false)

// Track tab and loading state
const dialog = reactive({
  tab: setStore.setsAvailable ? 'select' : 'add',
  loading: false
})

// Track user inputs from forms
const input = reactive({
  select: [] as number[],
  addMedia: [] as string[],
  addOther: [] as string[],
  delete: null as number | null
})

// Track return failures from API calls
const failures = reactive({ add: false, delete: false })

// Reset list selection reactively when workspace changes
watch(storeToRefs(setStore).setIds, () => input.select = setStore.setIds)

// Watch dialog state change and ensure all inputs are at default every time
watch(open, () => {
  dialog.loading = false
  dialog.tab = setStore.setsAvailable ? 'select' : 'add'
  input.select = setStore.currentSetIds
  input.addMedia = []
  input.addOther = []
  input.delete = null
  failures.add = false
  failures.delete = false
})

async function handleSelectSets() {
  // Update stored collection data
  setStore.currentSetIds = input.select
  open.value = false
  // Update displayed chemicals from the selected lists
  await chemicalStore.fetchChemicals(setStore.currentSetIds)
}

async function handleAddDashboardLists() {
  dialog.loading = true
  await Promise.all(input.addMedia.concat(input.addOther).map(buildSetFromDashboardList))
  .catch(() => failures.add = true)
  .then(() => {
    open.value = false
    chemicalStore.fetchChemicals(setStore.currentSetIds)
  })
}

// Helper to construct a single set from a dashboard list and submit to back-end
async function buildSetFromDashboardList(listName: string) {
  return setStore.createAndLoadSet(listName, workspaceStore.currentWorkspaceId)
  .then(async (set) => {
    return { dtxsids: await useNuxtApp().$ctx<string[]>(`ctx/list/chemicals/search/by-listname/${set.name}`), set_id: set.id }
  })
  .then(async (response) => chemicalStore.createChemicalsInCollection(response.dtxsids, response.set_id))
}

// Handle submission of set deletion to back-end
async function handleDeleteSet() {
  return await setStore.deleteSet(input.delete)
  .then(async () => {
    if (setStore.setsLoaded) {
      chemicalStore.fetchChemicals(setStore.currentSetIds)
    } else {
      chemicalStore.reset()
    }
  })
  .catch(() => failures.delete = true)
  .finally(() => open.value = false)
}
</script>
<template>
  <v-dialog activator="parent" v-model="open" transition="dialog-bottom-transition" max-width="800">
    <v-card>
      <v-toolbar title="Manage Lists" :color="COLOR">
        <template v-slot:extension>
          <v-tabs grow v-model="tab">
            <v-tab value="select" :disabled="!listStore.listsAvailable">Select Lists</v-tab>
            <v-tab value="add">Add Lists</v-tab>
            <v-tab value="delete" disabled>Delete Lists</v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="select">
            <v-form @submit.prevent="handleSelectLists">
              <v-autocomplete
                label="Choose Lists"
                v-model="selectListIds"
                :items="listStore.lists"
                item-title="name"
                item-value="id"
                persistent-hint
                hint="Leave blank to use entire workspace"
                class="my-2"
                single-line
                multiple
                chips
                clearable
                clear-on-select
              />
              <v-btn :color="COLOR" 
                type="submit"
                text="Select" 
              />
            </v-form>
          </v-tabs-window-item>
          <v-tabs-window-item value="add">
            <v-form @submit.prevent="handleAddDashboardLists">
              <div>
                Select the <a href="https://www.nature.com/articles/s41597-022-01365-8" target="_blank" rel="noopener noreferrer">Multimedia Monitoring Database</a> harmonized media appropriate to your chemical space:
              </div>
              <v-autocomplete
                label="MMDB Harmonized Media Lists"
                v-model="selectMediaListNames"
                :items="dashboardStore.mediaLists"
                item-title="title"
                item-value="value"
                multiple 
                chips
                clearable
                clear-on-select
                class="my-2"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :disabled="listStore.currentListNames.includes(item.raw.title)"
                  />
                </template>
              </v-autocomplete>
              <div>
                Select other <a href="https://comptox.epa.gov/dashboard/chemical-lists" target="_blank" rel="noopener noreferrer">CompTox Chemicals Dashboard</a> lists to further describe your chemical space:
              </div>
              <v-autocomplete
                label="Other Chemical Lists"
                v-model="selectOtherListNames"
                :items="dashboardStore.otherLists"
                item-title="title"
                item-value="value"
                class="my-2"
                multiple
                chips
                clearable
                clear-on-select
              >
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :disabled="listStore.currentListNames.includes(item.raw.title)"
                />
                </template>
              </v-autocomplete>
              <v-btn :color="COLOR" type="submit" :disabled="addLoading">Add</v-btn>
              <v-progress-linear v-if="addLoading" :color="COLOR" bg-color="light-green-lighten-1" indeterminate />
            </v-form>
          </v-tabs-window-item>
          <v-tabs-window-item value="delete">
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useDashboardStore } from '~/store/dashboard'
import { useListStore } from '~/store/lists'
import { useWorkspaceStore } from '~/store/workspaces'

const COLOR = 'light-green-darken-1'

// Load stored collection and chemical data for session
const dashboardStore = useDashboardStore()
const workspaceStore = useWorkspaceStore()
const listStore = useListStore()
const chemicalStore = useChemicalStore()

// Track open/closed state of dialog and tabs
const open = ref(false)
const tab = ref(listStore.listsAvailable ? 'select' : 'add')
// Track list selection in interface, updating reactively when workspace changes
const selectListIds = ref([])
watch(storeToRefs(workspaceStore).currentWorkspaceId, () => selectListIds.value = [])
// Track list additions in interface
const selectMediaListNames = ref([]) as Ref<string[]>
const selectOtherListNames = ref([]) as Ref<string[]>
const addLoading = ref(false)

function close() {
  open.value = false
  tab.value = listStore.listsAvailable ? 'select' : 'add'
  selectListIds.value = []
  selectMediaListNames.value = []
  selectOtherListNames.value = []
}

async function handleSelectLists() {
  // Update stored collection data
  listStore.currentListIds = selectListIds.value
  close()
  // Update displayed chemicals from the selected lists
  await chemicalStore.fetchDtxsids()
}

async function handleAddDashboardLists() {
  addLoading.value = true
  const uploadListNames = selectMediaListNames.value.concat(selectOtherListNames.value)
  for (const listName of uploadListNames) {
    await listStore.createList(listName, workspaceStore.currentWorkspaceId.value)
    .then(async (list) => {
      return { dtxsids: await useNuxtApp().$ctx<string[]>(`ctx/list/chemicals/search/by-listname/${list.name}`), collection_id: list.id }
    })
    .then(async (response) => await chemicalStore.createChemicals(response.dtxsids, response.collection_id))
  }

  addLoading.value = false
  close()
  chemicalStore.fetchDtxsids()
}
</script>
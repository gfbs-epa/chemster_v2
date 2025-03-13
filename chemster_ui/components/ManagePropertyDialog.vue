<template>
  <v-dialog activator="parent" v-model="open" max-width="800">
    <v-card>
      <v-toolbar title="Manage Properties" :color="COLOR" />
      <v-card-text>
        <v-form @submit.prevent="handleLoadProperties                           ">
          <v-autocomplete
            label="Choose Properties"
            v-model="input.selectIds"
            :items="ctxStore.properties"
            item-title="name"
            item-value="propertyId"
            class="my-2"
            single-line
            multiple
            chips
            clearable
            clear-on-select
          />
          <div>
            Select property prediction source:
          </div>
          <v-radio-group v-model="input.selectSource" :color="COLOR" class="my-2">
            <v-radio v-for="source in CTX_PROPERTY_SOURCES" :label="source" :value="source" />
          </v-radio-group>
          <v-btn type="submit" text="Load" :color="COLOR" :loading="dialog.loading" 
            :disabled="dialog.loading || !chemicalStore.chemicalsLoaded || input.selectIds.length == 0" />
        </v-form>
        <v-alert v-if="dialog.loading && dialog.warn == 'big'" text="This is a large list! Property loading may take 30-60 seconds." icon="$warning" color="grey-lighten-3" class="mt-2" />
        <v-alert v-else-if="dialog.loading && dialog.warn == 'verybig'" text="This is a very large list! Property loading may take up to two minutes." icon="$warning" color="grey-lighten-3" class="mt-2" />
        <v-alert v-if="failures.load" text="Property loading failed. Please try again." icon="$error" color="error" class="mt-2" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useCTXStore } from '~/store/ctx'
import { useVizStore } from '~/store/viz'
import { CTX_PROPERTY_SOURCES } from '~/utils/constants'

const COLOR = 'primary'

// Load chemical and property data stores
const ctxStore = useCTXStore()
const chemicalStore = useChemicalStore()
const vizStore = useVizStore()

// Track dialog open/close
const open = ref(false)

// Track dialog state
const dialog = reactive({
  loading: false,
  warn: ''
})

// Track failures from API calls
const failures = reactive({
  load: false
})

// Track user inputs
const input = reactive({
  selectIds: [] as string[],
  selectSource: 'TEST'
})

// Watch for dialog close and set all inputs to default
watch(open, () => {
  dialog.loading = false
  dialog.warn = ''
  failures.load = false
  input.selectIds = vizStore.propertyTable?.columns || []
})

// Submit API call for property data on current chemicals
async function handleLoadProperties() {
  dialog.loading = true
  dialog.warn = chemicalStore.currentDtxsids.length > 10000 ? 'verybig' : chemicalStore.currentDtxsids.length > 1000 ? 'big' : ''
  await vizStore.fetchPropertyTable(chemicalStore.currentDtxsids, input.selectIds, input.selectSource)
  .catch(() => failures.load = true)
  .then(() => open.value = false)
  .finally(() => dialog.loading = false)
}
</script>
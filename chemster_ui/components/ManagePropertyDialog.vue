<template>
  <v-dialog activator="parent" v-model="open" transition="dialog-bottom-transition" max-width="800">
    <v-card>
      <v-toolbar title="Manage Properties" :color="COLOR" />
      <v-card-text>
        <v-form @submit.prevent="handleLoadProperties                           ">
          <v-autocomplete
            label="Choose Properties"
            v-model="input.selectIds"
            :items="dashboardStore.properties"
            item-title="name"
            item-value="propertyId"
            single-line
            multiple
            chips
            clearable
            clear-on-select
          />
          <v-radio-group inline v-model="input.selectSource">
            <v-radio v-for="source in CTX_PROPERTY_SOURCES" :label="source" :value="source" />
          </v-radio-group>
          <v-btn type="submit" text="Load" :color="COLOR" :disabled="dialog.loading || !chemicalStore.chemicalsLoaded || input.selectIds.length == 0" />
        </v-form>
        <v-progress-linear v-if="dialog.loading" :color="COLOR" bg-color="grey-lighten-3" class="mt-2" indeterminate />
        <v-alert v-if="dialog.loading && dialog.warn == 'big'" text="This is a large list - property loading may take 30-60 seconds." icon="$warning" :color="COLOR" class="mt-2" />
        <v-alert v-else-if="dialog.loading && dialog.warn == 'verybig'" text="This is a very large list - property loading may take up to two minutes." icon="$warning" :color="COLOR" class="mt-2" />
        <v-alert v-if="failures.load" text="Property loading failed. Please try again." icon="$error" color="error" class="mt-2" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useChemicalStore } from '~/store/chemicals'
import { useDashboardStore } from '~/store/dashboard'
import { usePropertyStore } from '~/store/properties'
import { CTX_PROPERTY_SOURCES } from '~/utils/constants'

const COLOR = 'secondary'

// Load chemical and property data stores
const dashboardStore = useDashboardStore()
const chemicalStore = useChemicalStore()
const propertyStore = usePropertyStore()

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
  input.selectIds = propertyStore.currentPropertyData?.columns || []
})

// Submit API call for property data on current chemicals
async function handleLoadProperties() {
  dialog.loading = true
  dialog.warn = chemicalStore.currentDtxsids.length > 10000 ? 'verybig' : chemicalStore.currentDtxsids.length > 1000 ? 'big' : ''
  await propertyStore.fetchPropertyData(chemicalStore.currentDtxsids, input.selectIds, input.selectSource)
  .catch(() => failures.load = true)
  .then(() => open.value = false)
  .finally(() => dialog.loading = false)
}
</script>
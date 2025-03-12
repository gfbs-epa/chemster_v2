<template>
  <v-row>
    <v-col cols="12">
      <v-card class="bg-grey-lighten-3" flat>
        <v-card-text>
          <v-form @submit.prevent="addPlot">
            <v-container class="pa-0">
              <v-row class="align-center" no-gutters>
                <v-col cols="5">
                  <v-select
                    :items="displayProperties"
                    v-model="input.xprop"
                    label="X-axis Property"
                    hide-details
                    class="mx-2"
                  />
                </v-col>
                <v-col cols="5">
                  <v-select
                    :items="displayProperties.filter((p) => p.value !== input.xprop)"
                    v-model="input.yprop"
                    label="Y-axis Property"
                    hide-details
                    :disabled="!!!input.xprop"
                    class="mx-2"
                  />
                </v-col>
                <v-col cols="2" class="text-center">
                  <v-btn type="submit" text="Add Plot" color="primary" 
                    :disabled="!!!input.xprop || !!!input.yprop || plotStore.propertyScatterplotKeys.includes(`${input.xprop}_${input.yprop}`)" />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col v-for="(plt, i) in plotStore.propertyScatterplots" cols="12" sm="4" >
      <LazyPropertyScatterplotCard 
        hydrate-on-visible 
        :xprop="plt.xprop" 
        :yprop="plt.yprop" 
        :key="plt.key" 
        @close="plotStore.deletePropertyScatterplot(i)" 
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useCTXStore } from '~/store/ctx'
import { usePlotStore } from '~/store/plots'
import { usePropertyStore } from '~/store/properties'

const propertyStore = usePropertyStore()
const plotStore = usePlotStore()

const displayProperties = computed(() => propertyStore.currentPropertyData.columns.map((p) => { 
  return { title: useCTXStore().propertyNames.get(p), value: p } 
}))

const input = reactive({
  xprop: '',
  yprop: ''
})

function addPlot() {
  plotStore.addPropertyScatterplot(input.xprop, input.yprop)
  input.xprop = ''
  input.yprop = ''
}
</script>
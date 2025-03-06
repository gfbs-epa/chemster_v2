<template>
  <v-container fluid fill-height>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="ma-2 bg-grey-lighten-3" flat>
          <v-card-text>
            <v-form @submit.prevent="addPlot">
              <v-row class="align-center" no-gutters>
                <v-col cols="5">
                  <v-select
                    :items="propertyStore.currentPropertyData.columns"
                    v-model="input.xprop"
                    label="X-axis Property"
                    hide-details
                    class="mx-2"
                  />
                </v-col>
                <v-col cols="5">
                  <v-select
                    :items="propertyStore.currentPropertyData.columns.filter((p) => p !== input.xprop)"
                    v-model="input.yprop"
                    label="Y-axis Property"
                    hide-details
                    :disabled="!!!input.xprop"
                    class="mx-2"
                  />
                </v-col>
                <v-col cols="2" class="text-center">
                  <v-btn type="submit" text="Add Plot" color="primary" 
                  :disabled="!input.xprop || !input.yprop || pltkeys.includes(`${input.xprop}_${input.yprop}`)" />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col v-for="(plt, i) in plts" cols="12" sm="4" >
        <LazyPropertyScatterplotCard :xprop="plt.xprop" :yprop="plt.yprop" :key="plt.key" @close="plts.splice(i, 1)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { usePropertyStore } from '~/store/properties'

const propertyStore = usePropertyStore()

const input = reactive({
  xprop: '',
  yprop: ''
})

const plts = ref([]) as Ref<{ xprop: string, yprop: string, key: string }[]>
const pltkeys = computed(() => plts.value.map((p) => p.key))

function addPlot() {
  plts.value.push({
    xprop: input.xprop,
    yprop: input.yprop,
    key: `${input.xprop}_${input.yprop}`
  })

  input.xprop = ''
  input.yprop = ''
}
</script>
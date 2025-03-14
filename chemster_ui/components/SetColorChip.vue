<template>
  <v-chip prepend-icon="mdi-flask-empty" variant="flat" density="comfortable" size="small" class="mx-1" :color="hslaToHex(color)">
    <v-menu v-model="picker" location="top" :close-on-content-click="false" activator="parent">
      <v-card>
        <v-color-picker v-model="color" hide-inputs mode="hex" />
      </v-card>
    </v-menu>
    {{ setStore.setNamesMap.get(props.id) }}
    <template v-slot:append v-if="userDefined">
      <v-icon @click="color = DEFAULT_COLOR" class="ml-1">mdi-eraser</v-icon>
    </template>
  </v-chip>
</template>

<script setup lang="ts">
import { useSetStore } from '~/store/sets'
import { useVizStore } from '~/store/viz'
import { DEFAULT_COLOR } from '~/utils/constants'
import { hslaToHex } from '~/utils/colors'

const setStore = useSetStore()
const vizStore = useVizStore()

// Get set name from input properties
const props = defineProps({ id: { type: Number, required: true } })

// Open/close color picker
const picker = ref(false)
// Track selected color
const color = ref(vizStore.colorMap.get(props.id) || DEFAULT_COLOR)
const userDefined = ref(!!vizStore.colorMap.get(props.id))

// Update stored color map for plotting with color selections
watch(color, (to) => {
  if (to.h === DEFAULT_COLOR.h && to.s === DEFAULT_COLOR.s && to.l === DEFAULT_COLOR.l) {
    vizStore.colorMap.delete(props.id)
    userDefined.value = false
  } else {
    vizStore.colorMap.set(props.id, color.value)
    userDefined.value = true
  }
})
</script>
import { defineStore } from 'pinia'

export const usePlotStore = defineStore('plots',  () => {
  // User created scatterplots
  const propertyScatterplots = ref([]) as Ref<{ xprop: string, yprop: string, key: string }[]>

  // Getters for keys of current scatterplts to avoid duplication
  const propertyScatterplotKeys = computed(() => propertyScatterplots.value.map((p) => p.key))

  // Add a new property scatterplot
  function addPropertyScatterplot(xprop: string, yprop: string) {
    propertyScatterplots.value.push({
      xprop: xprop,
      yprop: yprop,
      key: `${xprop}_${yprop}`
    })
  }

  // Delete an existing property scatterplot
  function deletePropertyScatterplot(i: number) {
    propertyScatterplots.value.splice(i, 1)
  }

  return {
    propertyScatterplots,
    propertyScatterplotKeys,
    addPropertyScatterplot,
    deletePropertyScatterplot
  }
})
<template>
  <v-navigation-drawer floating color="grey-lighten-3">
    <v-list nav>
      <v-list-item nuxt to="/" title="Data Table" prepend-icon="mdi-table-large" color="primary" />
      <v-list-item nuxt to="/property-distributions" title="Property Distributions" prepend-icon="mdi-chart-bar" color="primary" />
      <v-list-item nuxt to="/property-relationships" title="Property Relationships" prepend-icon="mdi-chart-scatter-plot" color="primary" />
    </v-list>
  </v-navigation-drawer>
</template>
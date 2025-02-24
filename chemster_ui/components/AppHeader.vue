<template>
  <v-app-bar color="primary">
    <v-app-bar-title>ChemSTER: Chemical Space To Explorable Representations</v-app-bar-title>
    <template v-slot:append v-if="authStore.authenticated">
      <v-btn icon @click="authStore.logout" class="ma-1">
        <v-icon>mdi-logout</v-icon>
        <v-tooltip activator="parent" location="start" text="Logout" />
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

// Load user authentication data store for logout button
const authStore = useAuthStore()
</script>
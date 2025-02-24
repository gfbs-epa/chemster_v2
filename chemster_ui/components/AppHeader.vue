<template>
  <v-app-bar color="primary">
    <v-app-bar-title>ChemSTER: Chemical Space To Explorable Representations</v-app-bar-title>
    <template v-slot:append v-if="authStore.authenticated">
      <v-btn icon="mdi-logout" @click="authStore.logout" class="ma-1" />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

// Load user authentication data store for logout button
const authStore = useAuthStore()
</script>
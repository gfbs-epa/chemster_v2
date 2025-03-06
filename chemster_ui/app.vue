<template>
  <v-app>
    <AppHeader />
    <v-main>
      <NuxtPage />
    </v-main>
    <LazyAppFooter hydrate-on-visible v-if="authStore.authenticated" />
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

// Load the user data store to display footer if logged in
const authStore = useAuthStore()
</script>

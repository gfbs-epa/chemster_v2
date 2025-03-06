<template>
  <v-app>
    <AppHeader />
    <LazyAppDrawer hydrate-on-visible v-if="authStore.authenticated" />
    <v-main>
      <v-container fluid fill-height class="pa-0">
        <NuxtPage />
      </v-container>
    </v-main>
    <LazyManageMenu hydrate-on-visible v-if="authStore.authenticated" />
    <LazyAppFooter hydrate-on-visible v-if="authStore.authenticated" />
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

// Load the user data store to display drawer and footer if logged in
const authStore = useAuthStore()
</script>

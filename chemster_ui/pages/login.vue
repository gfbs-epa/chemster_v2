<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col align-self="center" cols="12" sm="3">
        <v-form v-model="valid" validate-on="input" @submit.prevent="handleLogin" class="py-5">
          <v-text-field v-model="credentials.username" :rules="usernameRules" class="my-2" required />
          <v-text-field v-model="credentials.password" type="password" :rules="passwordRules" class="my-2" required />
          <v-btn text="Login" :disabled="!valid" color="primary" type="submit" class="mr-2" />
          <v-btn text="Register" :disabled="!valid" @click="handleRegister" class="ml-2" />
          <v-alert v-if="failures.register" text="Registration failed. Please try again." icon="$error" color="error" class="mt-2" />
          <v-alert v-if="failures.login" text="Login failed. Please try again." icon="$error" color="error" class="mt-2" />
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { UI_INDEX_ENDPOINT } from '~/utils/constants'
import { required, minChars, maxChars, alphaFirst, safeChars } from '~/utils/validation-rules'

// Load user authentication
const authStore = useAuthStore()

// Track user input credentials
const credentials = reactive({ username: '', password: ''})

// Track input validity
const valid = ref(false)

// Track any failures from API calls
const failures = reactive({ register: false, login: false })

// Validate credentials in form
const usernameRules = [required(), minChars(3), maxChars(32), alphaFirst(), safeChars(false)]
const passwordRules = [required(), minChars(3), maxChars(32)]

// On button click, log user in
async function handleLogin() {
  await authStore.login(credentials)
  .then(async () => {
    failures.login = false
    navigateTo(UI_INDEX_ENDPOINT)
  })
  .catch(() => failures.login = true)
}

// On button click, register and log in new user
async function handleRegister() {
  await authStore.register(credentials)
  .then(async () => {
    failures.register = false
    navigateTo(UI_INDEX_ENDPOINT)
  })
  .catch(() => failures.register = true)
}
</script>
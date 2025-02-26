<template>
  <v-main>
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="3">
          <v-form v-model="validCredentials" validate-on="input" @submit.prevent="handleLogin" class="py-5">
            <v-text-field v-model="credentials.username" :rules="usernameRules" class="my-2" required />
            <v-text-field v-model="credentials.password" type="password" :rules="passwordRules" class="my-2" required />
            <v-btn text="Login" :disabled="!validCredentials" color="primary" type="submit" class="mr-2" />
            <v-btn text="Register" :disabled="!validCredentials" @click="handleRegister" class="ml-2" />
            <v-alert v-if="loginFailed" text="Login failed. Please try again." icon="$error" color="error" class="mt-2" />
            <v-alert v-if="registerFailed" text="Registration failed. Please try again." icon="$error" color="error" class="mt-2" />
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { UI_INDEX_ENDPOINT } from '~/utils/constants'

// Check authentication and redirect to index if already done
// Note useAuthStore must be called directly here or it will be undefined due to import order
definePageMeta({ middleware: [() => { if (useAuthStore().authenticated) { return navigateTo(UI_INDEX_ENDPOINT) } }] })

// Load user authentication
const authStore = useAuthStore()

// Validate credentials in form
const requiredRule = (str: string) => !!str || 'Required'
const charLimitRule = (str: string) => str.length <= 32 || 'Limit 32 characters'
const usernameRules = [ 
  requiredRule,
  (u: string) => /^[A-Za-z]+.*$/.test(u) || 'First character must be a letter',
  (u: string) => u.length >= 3 || 'At least 3 characters required',
  (u: string) => /^[\w\.]+$/.test(u) || 'Only letters, numbers, _, and . allowed',
  charLimitRule
]
const passwordRules = [
  requiredRule,
  charLimitRule
]

// Track state of form inputs
const credentials = reactive({ username: '', password: ''})

// Track validity of form and login and registration calls
// to show/hide alerts and enable/disable submission
const validCredentials = ref(false)
const loginFailed = ref(false)
const registerFailed = ref(false)

// On button click, log user in
async function handleLogin() {
  await authStore.login(credentials)
  .then(async () => {
    loginFailed.value = false
    await navigateTo(UI_INDEX_ENDPOINT)
  })
  .catch(() => { loginFailed.value = true })
}

// On button click, register and log in new user
async function handleRegister() {
  await authStore.register(credentials)
  .then(async () => {
    registerFailed.value = false
    await navigateTo(UI_INDEX_ENDPOINT)
  })
  .catch(() => { registerFailed.value = true })
}
</script>
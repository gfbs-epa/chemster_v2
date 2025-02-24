<template>
  <v-main>
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="3">
          <v-form v-model="validCredentials" validate-on="input" @submit.prevent="handleLogin" class="py-5">
            <v-text-field v-model="credentials.username" :rules="usernameRules" class="my-2" required />
            <v-text-field v-model="credentials.password" type="password" :rules="[ requiredRule ]" class="my-2" required />
            <v-btn text="Login" :disabled="!validCredentials" color="primary" type="submit" class="mr-2" />
            <v-btn text="Register" :disabled="!validCredentials" @click="handleRegister" class="ml-2" />
          </v-form>
          <div>
            <v-alert v-if="loginFailed" text="Login failed. Please try again." variant="tonal" icon="$error" color="error" class="mt-2" />
            <v-alert v-if="registerFailed" text="Registration failed. Please try again." variant="tonal" icon="$error" color="error" class="mt-2" />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

// Load user authentication
const authStore = useAuthStore()

// Validate credentials in form
const requiredRule = (str: string) => !!str || 'Required'
const usernameRules = [ 
  requiredRule,
  (u: string) => /^[A-Za-z]+.*$/.test(u) || 'First character must be a letter',
  (u: string) => u.length >= 3 || 'At least 3 characters required',
  (u: string) => /^[\w\.]+$/.test(u) || 'Only letters, numbers, _, and . allowed',
  (u: string) => /^[\w\.]+[^\.]$/.test(u) || 'Final character must not be .',
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
      await navigateTo('/')
    })
    .catch(() => { loginFailed.value = true })
}

// On button click, register and log in new user
async function handleRegister() {
  await authStore.register(credentials)
    .then(async () => {
      registerFailed.value = false
      await navigateTo('/')
    })
    .catch(() => { registerFailed.value = true })
}
</script>
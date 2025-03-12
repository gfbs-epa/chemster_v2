import { useAuthStore } from "~/store/auth"
import { UI_INDEX_ENDPOINT, UI_LOGIN_ENDPOINT } from "~/utils/constants"

// Global authentication middleware for all routes
export default defineNuxtRouteMiddleware((to) => {
  // Load authentication data store
  const authStore = useAuthStore()

  if (!authStore.authenticated && to.path !== UI_LOGIN_ENDPOINT) {
    // If the user is not authenticated, they cannot go anywhere but login
    return navigateTo(UI_LOGIN_ENDPOINT)
  } else if (authStore.authenticated && to.path === UI_LOGIN_ENDPOINT) {
    // If user is authenticated and tries to login, go to index instead
    return navigateTo(UI_INDEX_ENDPOINT)
  }
  
  // Otherwise permit navigation
  return
})
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'

// Set Vuetify "primary" theme color to EPA blue
const epa: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#0e6cb6',
    secondary: '#41b6e6'
  }
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'epa',
      themes: {
        epa
      }
    }
  })

  app.vueApp.use(vuetify)
})
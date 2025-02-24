import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'

const epaPrimary: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#005ea2',
  },
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'epaPrimary',
      themes: {
        epaPrimary
      }
    }
  })
  app.vueApp.use(vuetify)
})
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-plotly'
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    optimizeDeps: {
      include: ["plotly.js-dist-min"],
    }
  },
  runtimeConfig: {
    // Overridden by .env
    chemsterApiUrl: '',
    public: {
      masterCollectionId: '',
      comptoxImageUrl: '',
      ctxApiUrl: '',
      ctxApiKey: '',
      ctxApiRequestLimit: ''
    }
  }
})
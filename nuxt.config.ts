export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false, // client-only: uses localStorage + Chart.js
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Pity Ledger — Wuthering Waves Convene Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ]
    }
  },
  googleFonts: {
    families: {
      'Chakra+Petch': [400, 500, 600, 700],
      Inter: [400, 500, 600, 700, 800],
      'JetBrains+Mono': [500, 700]
    },
    display: 'swap'
  }
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: false  // Disabled runtime check (use 'npx nuxi typecheck' manually)
  },
  app: {
    head: {
      title: 'Roulette Strategy Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Professional Roulette Strategy Analysis Tool' }
      ],
    }
  }
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-06-13',
  devtools: { enabled: true },

  modules: ['@nuxt/ui'],

  colorMode: {
    preference: 'dark',
  },

  css: ['~/assets/css/main.css'],

  devServer: {
    port: 8510,
  },

  vite: {
    optimizeDeps: {
      include: [
        'tone',
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  app: {
    head: {
      title: 'MIDI Visualizer',
      meta: [
        { name: 'description', content: 'Drag & drop MIDI file visualizer' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})

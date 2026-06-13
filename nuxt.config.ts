// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-06-13',
  devtools: { enabled: true },

  devServer: {
    port: 8510,
  },

  vite: {
    plugins: [tailwindcss()],
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
    },
  },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  srcDir: 'src/',

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt'
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Tryout Akbar SNBT',
      short_name: 'Tryout',
      theme_color: '#4F46E5',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: 'pwa-icons/icon.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'pwa-icons/icon.png', // Using same icon for simplicity
          sizes: '192x192',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
    },
  },

  app: {
    head: {
      title: 'Tryout Akbar SNBT 2026 - Platform Simulasi UTBK Terbaik',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Simulasi UTBK-SNBT 2026 dengan sistem penilaian IRT, analisis kelemahan, dan pembahasan lengkap. Siapkan dirimu masuk PTN impian!' },
        { name: 'format-detection', content: 'telephone=no' },
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://tryout-akbar.com/' },
        { property: 'og:title', content: 'Tryout Akbar SNBT 2026' },
        { property: 'og:description', content: 'Simulasi UTBK-SNBT 2026 dengan sistem penilaian IRT.' },
        { property: 'og:image', content: 'https://tryout-akbar.com/og-image.jpg' },
        // Twitter
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: 'https://tryout-akbar.com/' },
        { property: 'twitter:title', content: 'Tryout Akbar SNBT 2026' },
        { property: 'twitter:description', content: 'Simulasi UTBK-SNBT 2026 dengan sistem penilaian IRT.' },
        { property: 'twitter:image', content: 'https://tryout-akbar.com/og-image.jpg' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      script: [
        {
          src: 'https://app.sandbox.midtrans.com/snap/snap.js',
          'data-client-key': process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy-key'
        }
      ]
    }
  },

  supabase: {
    redirect: false
  }
})

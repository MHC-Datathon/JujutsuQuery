import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  site: 'https://clearlane.org',
  integrations: [
    tailwind({
      applyBaseStyles: false, // We'll handle base styles ourselves
    }),
    react({
      include: ['**/react/*', '**/charts/*', '**/visualizations/*']
    })
  ],
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
    speedInsights: {
      enabled: true
    }
  }),
  vite: {
    optimizeDeps: {
      include: ['d3', 'chart.js', 'papaparse', 'leaflet']
    },
    ssr: {
      noExternal: ['d3', 'leaflet']
    }
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});
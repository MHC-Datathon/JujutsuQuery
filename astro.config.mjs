import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://basirs.github.io',
  base: '/ACE_Intelligence_System',
  integrations: [
    tailwind({
      applyBaseStyles: false, // We'll handle base styles ourselves
    }),
    react({
      include: ['**/react/*', '**/charts/*', '**/visualizations/*']
    })
  ],
  output: 'static',
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
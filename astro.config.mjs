// @ts-check
import { rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// public/mock/ solo sirve para `astro dev` (ver .env.development): no se publica.
const sinMock = {
  name: 'sin-mock',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await rm(new URL('mock/', dir), { recursive: true, force: true });
    },
  },
};

export default defineConfig({
  site: 'https://epeim.com.ar',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Precarga la página de un link al pasar el mouse o hacer foco (y los del menú del celular al
  // abrirlo): la navegación es casi instantánea y la transición entre páginas no se cancela.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [sitemap(), sinMock],
  vite: { plugins: [tailwindcss()] },
});

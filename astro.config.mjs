// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Set SITE / BASE_PATH when deploying under a subpath, e.g.
//   SITE=https://user.github.io BASE_PATH=/SimpleStaticGallery npm run build
export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE_PATH ?? '/',
  output: 'static',
  integrations: [mdx()],
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import chromeManifest from './manifest.json';
import firefoxManifest from './manifest.firefox.json';

export default defineConfig(() => {
  const browserTarget = process.env.BROWSER_TARGET || 'chrome';
  const manifest = (browserTarget === 'firefox' ? firefoxManifest : chromeManifest) as any;

  return {
    plugins: [react(), crx({ manifest })]
  };
});

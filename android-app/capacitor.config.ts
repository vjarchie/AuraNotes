import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Paths are relative to this file (android-app/). The web app is built at repo root: ../dist
 */
const config: CapacitorConfig = {
  appId: 'com.aurnotes.app',
  appName: 'Aura Notes',
  webDir: '../dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

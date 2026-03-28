import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.knightsoath.game',
  appName: "Knight's Oath",
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;

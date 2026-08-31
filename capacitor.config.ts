import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.polylearn.app',
  appName: 'PolyLearn',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0A0C10",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#4F46E5"
    }
  }
};

export default config;

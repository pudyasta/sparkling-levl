// @ts-nocheck
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';
import type { AppConfig } from 'sparkling-app-cli';

import lynxConfig from './lynx.config.ts';

// @ts-ignore
const config: AppConfig = {
  lynxConfig: lynxConfig,
  appName: 'Levl',
  devtool: true,
  platform: {
    android: {
      packageName: 'com.example.sparkling.go',
    },
    ios: {
      bundleIdentifier: 'com.example.sparkling.go',
    },
  },
  paths: {
    androidAssets: 'android/app/src/main/assets',
    iosAssets: 'ios/SparklingGo/SparklingGo/Resources/Assets',
  },
  router: {
    main: { path: './lynxPages/main' },
    second: { path: './lynxPages/second' },
    login: { path: './lynxPages/login' },
  },
  plugin: [
    [
      'splash-screen',
      {
        backgroundColor: '#232323',
        image: './resource/app_icon.png',
        dark: {
          image: './resource/app_icon.png',
          backgroundColor: '#000000',
        },
        imageWidth: 200,
      },
    ],
  ],
};

export default config;

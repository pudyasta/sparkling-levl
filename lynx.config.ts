import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import { pluginTypedCSSModules } from '@rsbuild/plugin-typed-css-modules';

export default defineConfig({
  source: {
    entry: {
      main: './src/pages/Login/index.tsx',
      second: './src/pages/Main/index.tsx',
      login: './src/pages/Login/index.tsx',
      register: './src/pages/Register/index.tsx',
      emailConfirmation: './src/pages/EmailConfirmation/index.tsx',
    },
  },
  output: {
    assetPrefix: 'asset:///',
    filename: {
      bundle: '[name].lynx.bundle',
    },
  },
  plugins: [
    pluginQRCode({
      schema(url: string) {
        return {
          http: `http://${url}?fullscreen=true`,
          hybrid: `hybrid://lynxview_page?bundle=${url}?fullscreen=true`,
        };
      },
    }),
    pluginReactLynx(),
    pluginTypedCSSModules(),
  ],
});

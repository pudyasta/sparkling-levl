import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';
import { pluginTypedCSSModules } from '@rsbuild/plugin-typed-css-modules';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  source: {
    entry: {
      main: './src/pages/Main/index.tsx',
      login: './src/pages/Login/index.tsx',
      register: './src/pages/Register/index.tsx',
      emailConfirmation: './src/pages/EmailConfirmation/index.tsx',
      courseDetail: './src/pages/CourseDetail/index.tsx',
      lessons: './src/pages/Lessons/index.tsx',
      forgotPassword: './src/pages/ForgotPassword/index.tsx',
      quiz: './src/pages/Quiz/index.tsx',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@login': path.resolve(__dirname, './src/pages/Login'),
      '@register': path.resolve(__dirname, './src/pages/Register'),
      '@course_detail': path.resolve(__dirname, './src/pages/CourseDetail'),
      '@email_confirmation': path.resolve(__dirname, './src/pages/EmailConfirmation'),
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
          http: `${url}?fullscreen=true`,
          hybrid: `hybrid://lynxview_page?bundle=${url}?fullscreen=true`,
        };
      },
    }),
    pluginReactLynx(),
    pluginTypedCSSModules(),
  ],
});

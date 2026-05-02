# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sparkling-levl** is a Lynx-based cross-platform learning application (iOS/Android) built with TypeScript and React. It's a brownfield Lynx app based on the TikTok Sparkling framework, implementing an educational platform with courses, lessons, quizzes, and user profiles.

- **Framework**: Lynx (TikTok's cross-platform rendering engine with native bridge)
- **Frontend**: React + TypeScript (with @lynx-js/react)
- **Build Tool**: Rspeedy (Rsbuild-based, configured in lynx.config.ts)
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: React Context + TanStack Query
- **Testing**: Vitest
- **Native Platforms**: iOS (Podfile) and Android (Gradle)
- **Backend API**: REST API at https://levl-backend.site/api/v1

## Build, Test, and Lint Commands

### Development
- `npm run dev` - Start the Rspeedy dev server with hot reload
- `npm run doctor` - Run health check on the project setup

### Building
- `npm run build` - Build the app for production (uses sparkling-app-cli with asset copy)
- `npm run autolink` - Auto-link native dependencies (sparkling-navigation, sparkling-storage, sparkling-debug-tool)

### Testing
- `npm run test` - Run all tests with Vitest (coverage includes v8 provider with text, json, lcov, and html reporters)
- `npm exec vitest run -- <pattern>` - Run specific tests by pattern (e.g., `npm exec vitest run -- Auth`)

### Mobile Platforms
- `npm run run:android` - Build and run on Android device/emulator
- `npm run run:ios` - Build and run on iOS device/simulator (also runs fixIos.ts pre-build)

### Code Quality
- **Formatting**: Prettier with import sort and Tailwind CSS plugins
- **Linting**: ESLint plugins configured (eslint-plugin-simple-import-sort)
- **TypeScript**: Strict mode enabled; check with `npx tsc --noEmit`

## Architecture

### Entry Points (Lynx Bundles)
Defined in `lynx.config.ts`, each entry point becomes a separate bundle:
- **main** → src/pages/main/index.tsx - Tabbed dashboard (Home, Courses, Ranking, Profile)
- **login** → src/pages/Login/index.tsx - Authentication
- **register** → src/pages/Register/index.tsx - User registration
- **emailConfirmation** → src/pages/EmailConfirmation/index.tsx - Email verification
- **courseDetail** → src/pages/CourseDetail/index.tsx - Course details view
- **lessons** → src/pages/Lessons/index.tsx - Lesson content
- **quiz** → src/pages/Quiz/index.tsx - Quiz interface
- **forgotPassword** → src/pages/ForgotPassword/index.tsx - Password recovery
- **myCourse** → src/pages/MyCourses/index.tsx - User's enrolled courses

Each page entry calls `initComponent()` which wraps the component with providers and renders it via Lynx's root.

### Context Providers (src/context/)
Layered in AppProvider.tsx in this order:
1. **QueryClientProvider** (@tanstack/react-query) - Server state management with 1 retry and disabled refetch on focus
2. **NativeBridgeProvider** - Auth, token refresh, navigation, and native bridge integration
3. **StyleProvider** - Theme management (Dark/Light)

### Authentication Flow
**NativeBridgeProvider** (src/context/NativeBridgeProvider.tsx) manages:
- Token storage/retrieval via sparkling-storage (PrefKey.Token in BizKey.Authorization)
- Automatic token refresh on 401 using refreshTokenApi
- User state hydration from local storage
- Navigation via sparkling-navigation router
- Three-phase hydration (params, token, user) before rendering

### API Layer (src/lib/api/)
- **core.ts** exports:
  - `guestAPIClient(url, config)` - Unauthenticated requests (used for auth endpoints)
  - `useApiClient()` hook returning `{ api, guestAPIClient }` - Authenticated requests with auto-refresh on 401
  - `refreshTokenApi(refreshToken)` - Token refresh endpoint
  - `ApiResponse<T>` interface for all API responses
- **Axios instance** at baseURL https://levl-backend.site/api/v1 with JSON headers

### API Constants (src/constant/api.ts)
- API_BASE_URL, method constants (GET, POST, PUT, DELETE)
- Route endpoints defined in @/constant/route

### Repository Pattern (src/pages/*/repository/)
Each page has a repository layer for API calls:
- **useLoginRepo.ts** - Login/logout API calls
- **useRegister.ts** - Registration API
- **useResendVerificationEmailRepo.ts** - Email resend
- Returns useQuery hooks from @tanstack/react-query

### Validation (src/pages/*/usecase/)
- **loginValidation.ts**, **registerValidation.ts** - Yup schemas for form validation

### Components Architecture
- **src/components/common/** - Reusable UI (Button, Card, Modal, Tabs, CustomImage, IconWithBackground, Shimmer)
- **src/components/Text/** - Text component with utility handlers for font properties and color
- **src/components/Input/** - Form input with CSS modules
- **src/components/CoursesCard/** - Course display card
- **src/components/Loading/** - Loading state with CSS animations
- **src/components/PullToRefresh/** - Pull-to-refresh gesture handler
- **src/components/Errorpage/** - ErrorBoundary and error UI
- All CSS modules are typed via .module.css.d.ts files

### Main Page (src/pages/main/)
Multi-tab interface via Tabs component with:
- **Home** - Dashboard
- **Courses** - Browse courses with CategoryLabel and CourseCard
- **Leaderboard** - Rankings
- **Profile** - User profile screen

Each tab is lazy-rendered via the Tabs component's content prop.

### Utilities
- **src/lib/helper/localStorage.ts** - Preference key constants and typed storage helpers
- **src/lib/helper/isTokenValid.ts** - Token expiry validation
- **src/lib/helper/validate.ts** - Validation utilities
- **src/lib/helper/showToast.ts** - Toast notification wrapper
- **src/lib/helper/filePicker.ts**, **uploadFile.ts** - File operations
- **src/lib/helper/getTime.ts** - Time formatting

### Styling
- **Tailwind CSS** with @lynx-js/tailwind-preset for Lynx-specific utilities
- Custom preset in tailwind.config.js with shimmerMove keyframe animation
- CSS Modules for component-scoped styles (src/components/*/Component.module.css)
- PostCSS configured via postcss.config.js

### Native Integration
- **iOS** (ios/Podfile): Cocoapods with Sparkling 2.0.1, Lynx 3.6.0, Media3 ExoPlayer, SDWebImage
- **Android** (android/app/build.gradle.kts): Gradle with Kotlin, Sparkling 2.0.1, Lynx, OkHttp, Fresco, Media3
- Assets copied to android/app/src/main/assets or ios/LynxResources via app.config.ts

### Path Aliases (tsconfig.json)
- `@/*` -> ./src/
- `@login/*` -> ./src/pages/Login/
- `@register/*` -> ./src/pages/Register/
- `@course_detail/*` -> ./src/pages/CourseDetail/
- `@email_confirmation/*` -> ./src/pages/EmailConfirmation/

## Key Dependencies

### Core
- @lynx-js/react ^0.116.5 - React for Lynx
- @lynx-js/types - TypeScript types for Lynx globals
- @tanstack/react-query ^5.100.5 - Server state management
- axios ^1.15.2 - HTTP client

### Sparkling Framework
- sparkling-method ^2.0.1 - Native method bridge
- sparkling-navigation ^2.0.1 - Router (router.navigate, router.close)
- sparkling-storage ^2.0.1 - Persistent storage (getItem, setItem)
- sparkling-app-cli ~2.0.1 - Build tool

### Styling & Forms
- tailwindcss ^3.4.19 - Utility-first CSS
- yup ^1.7.1 - Schema validation
- postcss-loader ^8.2.1 - PostCSS integration

### Dev Tools
- Vitest ^4.1.5 - Test runner with jsdom and @testing-library/jest-dom
- TypeScript ^5.9.3 - Strict mode enabled
- Prettier ^3.8.3 - Code formatter with import sorting and Tailwind plugins
- @lynx-js/rspeedy ^0.13.6 - Dev server
- @rsbuild/plugin-typed-css-modules - CSS module typing

## Important Notes

### Entry Point Pattern
Each page bundle must call `initComponent(ComponentType)` in its index.tsx. This function:
1. Renders the component via Lynx's root.render()
2. Wraps it with AppProvider (all 3 context layers)
3. Passes native props from lynx.__globalProps
4. Handles HMR in dev mode

### Token Expiry
Tokens include expires_in (seconds from issuance). The code adds current timestamp when storing to convert to absolute expiry time. isTokenValid() then checks if current time < expires_in.

### Navigation
Uses sparkling-navigation (TikTok's native router):
- `router.navigate({ path: 'bundle.lynx.bundle', options: { params } }, callback)`
- Special param `hide_nav_bar: 1` hides native navigation
- `close: true` closes the current container after navigation
- Params persisted in storage via NativeBridgeProvider

### Hydration Pattern
Components only render after 3-phase hydration completes (params, token, user loaded from storage). This prevents flash of login screen or missing state.

### Asset Prefix
Lynx-specific: `assetPrefix: 'asset:///'` in lynx.config.ts routes assets through native image handler.

### Testing
- Vitest configured via @lynx-js/react/testing-library/vitest-config
- Coverage providers: v8 with multiple reporters
- Excluded from coverage: node_modules, dist, tests directories, configs, mock data
- Run specific tests: `npm exec vitest run -- --grep <pattern>`

## References
- Lynx Documentation: https://lynxjs.org/next/llms.txt (required reading)
- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- TikTok Sparkling: https://tiktok.github.io/sparkling/

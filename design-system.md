# Levl Design System

> A mobile-first design system for the Levl learning app built on Lynx framework. Inspired by Tokopedia, Shopee, and Gojek — Indonesian-focused, green-dominant, flat, and clean.

## Design philosophy

- **Flat & clean** — no gradients, minimal shadows, solid colors only
- **Mobile-first** — designed for narrow viewports (~380px), thumb-friendly tap targets
- **Indonesian-first** — UI copy in Bahasa Indonesia
- **Green-dominant** — single primary color, orange used sparingly as accent
- **Generous whitespace** — 16px padding inside cards, 12px between cards
- **Status via color** — green for success, orange for pending, red for failed
- **Rounded everywhere** — 12px for cards, 8px for inputs/buttons, full radius for badges
- **Bold numbers** — prices, progress percentages, and key metrics use weight 700

## Color tokens

### Brand palette

| Token          | Hex       | Usage                                         |
| -------------- | --------- | --------------------------------------------- |
| Primary        | `#1A73E8` | Main CTA, active states, progress bars, links |
| PrimaryDark    | `#1557B0` | Hover/active state of primary                 |
| PrimaryLight   | `#E8F0FE` | Light primary tint, accent backgrounds        |
| Secondary      | `#FFC107` | Accent only — highlights, ratings, attention  |
| SecondaryDark  | `#E0A800` | Hover state of secondary                      |
| SecondaryLight | `#FFF8E1` | Light accent backgrounds                      |
| Accent         | `#E8F0FE` | Subtle highlights, selected states            |

### Semantic colors

| Token   | Hex       | Background tint | Usage                                   |
| ------- | --------- | --------------- | --------------------------------------- |
| Success | `#28A745` | `#E6F4EA`       | Completed, submitted, success messages  |
| Warning | `#FFC107` | `#FFF8E1`       | Pending, draft, attention needed        |
| Error   | `#DC3545` | `#FDE8E9`       | Errors, destructive actions, validation |
| Info    | `#1A73E8` | `#E8F0FE`       | Informational, neutral notices          |

### Neutral scale

| Token | Hex       | Usage                           |
| ----- | --------- | ------------------------------- |
| N50   | `#F9FAFB` | Page background                 |
| N100  | `#F3F4F6` | Dividers, subtle backgrounds    |
| N200  | `#E5E7EB` | Borders, separators             |
| N300  | `#D1D5DB` | Disabled borders                |
| N400  | `#9AA0A6` | Disabled text, placeholder text |
| N500  | `#6B7280` | Tertiary text, captions         |
| N600  | `#4B5563` | Secondary text                  |
| N700  | `#374151` | Strong secondary text           |
| N900  | `#202124` | Primary text, headings          |

### Surface colors

| Token      | Hex       | Usage                  |
| ---------- | --------- | ---------------------- |
| Background | `#F9FAFB` | Page/screen background |
| Surface    | `#FFFFFF` | Cards, sheets, modals  |
| Border     | `#E5E7EB` | Component borders      |
| Divider    | `#F3F4F6` | Section separators     |

## Typography

**Font families:**

- **Headings:** Plus Jakarta Sans (`'Plus Jakarta Sans', sans-serif`)
- **Body:** Inter (`'Inter', sans-serif`)

Both fonts are free on Google Fonts. Use Jakarta for any text using H1–H3 or Display styles, and Inter for everything else (body, caption, buttons, labels).

| Style   | Font    | Size | Weight | Line height | Usage                                     |
| ------- | ------- | ---- | ------ | ----------- | ----------------------------------------- |
| Display | Jakarta | 28px | 700    | 36px        | Splash screens, big promotional headlines |
| H1      | Jakarta | 22px | 700    | 30px        | Page titles                               |
| H2      | Jakarta | 18px | 600    | 26px        | Section headings                          |
| H3      | Jakarta | 16px | 600    | 24px        | Card titles, subsection headings          |
| BodyLg  | Inter   | 16px | 400    | 24px        | Lead paragraphs                           |
| Body    | Inter   | 14px | 400    | 20px        | Default body text                         |
| BodySm  | Inter   | 13px | 400    | 18px        | Secondary text, dense lists               |
| Caption | Inter   | 12px | 500    | 16px        | Labels, metadata, badges                  |
| Button  | Inter   | 14px | 600    | 20px        | Button labels                             |

**Rules:**

- Sentence case always — never Title Case, never ALL CAPS
- Use only weights 400, 500, 600, 700
- Numbers and key data use weight 700 for emphasis
- Body text never below 12px

## Spacing scale (4pt base)

| Token | Value | Usage                                              |
| ----- | ----- | -------------------------------------------------- |
| xs    | 4px   | Tight spacing between related items (icon + label) |
| sm    | 8px   | Compact spacing                                    |
| md    | 12px  | Default spacing between cards in a list            |
| lg    | 16px  | Padding inside cards, default section spacing      |
| xl    | 24px  | Spacing between major sections                     |
| 2xl   | 32px  | Page-level vertical rhythm                         |
| 3xl   | 48px  | Hero spacing, splash separations                   |

## Border radius

| Token | Value  | Usage                                    |
| ----- | ------ | ---------------------------------------- |
| sm    | 4px    | Small elements, tags inside cards        |
| md    | 8px    | Buttons, inputs, small cards             |
| lg    | 12px   | Cards, modals, bottom sheets             |
| xl    | 16px   | Hero cards, feature banners              |
| full  | 9999px | Pills, badges, avatars, circular buttons |

**Rule:** Never use rounded corners on single-sided borders. If using `border-left` or `border-top` accents, keep radius at 0.

## Component patterns

### Buttons

**Variants:**

| Variant   | Background  | Text      | Border        | Usage                            |
| --------- | ----------- | --------- | ------------- | -------------------------------- |
| Primary   | `#03AC0E`   | White     | None          | Main CTA, submit, primary action |
| Secondary | White       | `#03AC0E` | `#03AC0E` 1px | Alternative action               |
| Ghost     | Transparent | `#03AC0E` | None          | Tertiary actions, "Cancel"       |
| Danger    | `#EE2A2A`   | White     | None          | Delete, destructive              |
| Disabled  | `#E5E7EB`   | `#9CA3AF` | None          | Inactive state                   |

**Sizes:**

| Size | Padding   | Font size | Usage                                 |
| ---- | --------- | --------- | ------------------------------------- |
| sm   | 6px 12px  | 12px      | Inline actions, secondary spots       |
| md   | 10px 16px | 14px      | Default                               |
| lg   | 14px 24px | 15px      | Hero CTAs, full-width primary actions |

**Rules:**

- Always full-width on mobile for primary CTAs
- Min tap area: 44x44px
- Border radius: 8px
- Active state: scale down to 0.98 + darken bg by one shade
- Loading state: replace text with spinner, keep button width

### Cards

**Default card:**

- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Radius: `12px`
- Padding: `16px`
- Margin between cards: `12px`

**Course card pattern:**

- Banner image: full width, height 128px, `object-fit: cover`
- Content padding: `12px`
- Level badge above title
- Title: 14px, weight 600, max 2 lines
- Metadata: 11px, color `#6B7280`
- Progress bar: 4px tall, primary color fill on neutral track

### Badges

**Style:**

- Background: light tint of semantic color
- Text: dark variant of semantic color (weight 600)
- Padding: 3px 8px
- Border radius: full (9999px)
- Font size: 11px

**Variants:**

| Variant | Bg        | Text      | Usage                        |
| ------- | --------- | --------- | ---------------------------- |
| Success | `#E8F8E9` | `#024F08` | Completed, active, submitted |
| Warning | `#FFF4E0` | `#854F0B` | Pending, draft               |
| Danger  | `#FDE8E8` | `#791F1F` | Failed, error                |
| Info    | `#E6F1FB` | `#0C447C` | Informational                |
| Neutral | `#F3F4F6` | `#374151` | Generic tags                 |
| Primary | `#03AC0E` | White     | "New", featured              |

### Form inputs

**Text input:**

- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border radius: `8px`
- Padding: `10px 12px`
- Font size: `14px`
- Focus: border color → primary `#03AC0E`, no outline
- Error: border color → `#EE2A2A`, error message 11px below
- Label above input: 12px, weight 500, color `#374151`, margin-bottom 6px

### Bottom navigation

- Height: 60px
- Background: `#FFFFFF`
- Top border: `1px solid #E5E7EB`
- Active tab: primary color icon + label, 2px top border in primary
- Inactive tab: `#6B7280` icon and label
- Icon size: 24px
- Label size: 11px

### Modals & bottom sheets

**Modal:**

- Background overlay: `rgba(0, 0, 0, 0.45)`
- Modal background: `#FFFFFF`
- Border radius: `16px` (top corners only for bottom sheet)
- Padding: `24px`
- Max width: `340px` (centered for dialog modals)
- Title: H2 (18px, weight 600)
- Body: Body (14px, color `#4B5563`)
- Actions: stacked vertically on mobile, primary on top

**Bottom sheet:**

- Top corners radius: `16px`
- Drag handle: 4px tall, 36px wide, `#D1D5DB`, centered, 8px top margin
- Slides up from bottom with `cubic-bezier(0.25, 0.1, 0.25, 1)` 350ms

### Status colors mapping (Lynx app context)

Mapped to your specific app states:

| Status           | Color          | Label (ID)        |
| ---------------- | -------------- | ----------------- |
| Completed lesson | Success green  | "Selesai"         |
| In progress      | Info blue      | "Sedang berjalan" |
| Locked           | Neutral gray   | "Terkunci"        |
| Submitted        | Success green  | "Dikumpulkan"     |
| Draft            | Warning orange | "Draft"           |
| Failed/Rejected  | Danger red     | "Gagal"           |
| Pending review   | Warning orange | "Menunggu nilai"  |

## Iconography

- Icon library: **Tabler Icons** (outline style) or **Heroicons** (outline)
- Default size: 24px in nav, 20px inline with text, 16px in badges
- Stroke width: 1.5
- Color: inherits from parent text color
- Never use emoji as icons in UI

## Layout patterns

### Page structure

```
┌────────────────────────────────┐
│ Header (60px, top fixed)       │  bg: white, border-bottom: N200
├────────────────────────────────┤
│                                │
│ ScrollView                     │  bg: #F9FAFB
│   ├─ Section title (H2)        │
│   ├─ Card                      │
│   ├─ Card                      │
│   └─ Card                      │
│                                │
├────────────────────────────────┤
│ Bottom nav (60px, bottom fixed)│  bg: white, border-top: N200
└────────────────────────────────┘
```

### List spacing

- Section title to first card: 12px
- Between cards: 12px
- Last card to next section: 24px
- Page padding (horizontal): 16px

### Grid for cards (2 columns)

- Column gap: 12px
- Row gap: 12px
- Card aspect ratio: 16:9 banner + content

## Animation & motion

- **Easing:** `cubic-bezier(0.25, 0.1, 0.25, 1)` for most transitions
- **Page transitions:** 300ms slide
- **Modal:** 250ms fade + scale from 0.95
- **Bottom sheet:** 350ms slide
- **Button press:** 100ms scale to 0.98
- **Loading spinner:** primary color, 1s rotation

**Rules:**

- No animations longer than 400ms
- Respect `prefers-reduced-motion`
- Skeleton loading instead of spinners for content

## Voice & tone (Bahasa Indonesia)

| Context              | Tone                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| Success messages     | Warm, encouraging — "Yeay kamu berhasil!"                              |
| Error messages       | Helpful, not blame-y — "Coba lagi ya!"                                 |
| Empty states         | Friendly, action-oriented — "Belum ada tugas. Mulai belajar dulu yuk!" |
| Confirmation dialogs | Clear, direct — "Yakin keluar dari halaman ini?"                       |
| Loading states       | Brief — "Memuat..."                                                    |

**Word bank:**

| English      | Indonesian (preferred) |
| ------------ | ---------------------- |
| Submit       | Kumpulkan              |
| Save         | Simpan                 |
| Cancel       | Batal                  |
| Continue     | Lanjutkan              |
| Back         | Kembali                |
| Done         | Selesai                |
| Next         | Selanjutnya            |
| Login        | Masuk                  |
| Logout       | Keluar                 |
| Lesson       | Pelajaran              |
| Assignment   | Tugas                  |
| Quiz         | Kuis                   |
| Course       | Kursus                 |
| Beginner     | Pemula                 |
| Intermediate | Menengah               |
| Advanced     | Lanjutan               |

## Code reference

### Token file (TypeScript)

```typescript
export interface ColorPalette {
  Primary: string;
  Secondary: string;
  Accent: string;
  Success: string;
  Error: string;
  Neutral: string;
  Background: string;
  Disabled: string;
}

export const LightColors: ColorPalette = {
  Primary: '#1A73E8',
  Secondary: '#FFC107',
  Accent: '#E8F0FE',
  Success: '#28A745',
  Error: '#DC3545',
  Neutral: '#202124',
  Background: '#FFFFFF',
  Disabled: '#9AA0A6',
};

// Extended tokens for full design system
export const Colors = {
  ...LightColors,
  PrimaryDark: '#1557B0',
  PrimaryLight: '#E8F0FE',
  SecondaryDark: '#E0A800',
  SecondaryLight: '#FFF8E1',
  Warning: '#FFC107',
  Info: '#1A73E8',
  SuccessBg: '#E6F4EA',
  WarningBg: '#FFF8E1',
  ErrorBg: '#FDE8E9',
  InfoBg: '#E8F0FE',
  N50: '#F9FAFB',
  N100: '#F3F4F6',
  N200: '#E5E7EB',
  N300: '#D1D5DB',
  N400: '#9AA0A6',
  N500: '#6B7280',
  N600: '#4B5563',
  N700: '#374151',
  N900: '#202124',
  Surface: '#FFFFFF',
  Border: '#E5E7EB',
  Divider: '#F3F4F6',
  TextPrimary: '#202124',
  TextSecondary: '#4B5563',
  TextTertiary: '#6B7280',
  TextDisabled: '#9AA0A6',
  TextInverse: '#FFFFFF',
} as const;

export const Fonts = {
  heading: "'Plus Jakarta Sans', sans-serif",
  body: "'Inter', sans-serif",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Typography = {
  display: { fontFamily: Fonts.heading, fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h1: { fontFamily: Fonts.heading, fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h2: { fontFamily: Fonts.heading, fontSize: 18, fontWeight: '600', lineHeight: 26 },
  h3: { fontFamily: Fonts.heading, fontSize: 16, fontWeight: '600', lineHeight: 24 },
  bodyLg: { fontFamily: Fonts.body, fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySm: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontFamily: Fonts.body, fontSize: 12, fontWeight: '500', lineHeight: 16 },
  button: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600', lineHeight: 20 },
} as const;
```

### Tailwind config

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#E8F0FE',
          100: '#D2E3FC',
          200: '#A8C7FA',
          400: '#4285F4',
          500: '#1A73E8',
          600: '#1557B0',
          700: '#0D47A1',
        },
        secondary: {
          50: '#FFF8E1',
          400: '#FFC107',
          600: '#E0A800',
        },
        accent: '#E8F0FE',
        success: { 50: '#E6F4EA', 500: '#28A745', 700: '#1E7E34' },
        warning: { 50: '#FFF8E1', 500: '#FFC107', 700: '#856404' },
        error: { 50: '#FDE8E9', 500: '#DC3545', 700: '#A71D2A' },
        info: { 50: '#E8F0FE', 500: '#1A73E8', 700: '#1557B0' },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          400: '#9AA0A6',
          500: '#6B7280',
          700: '#374151',
          900: '#202124',
        },
      },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
    },
  },
};
```

### HTML setup (load Google Fonts)

Add to your `index.html` or root layout:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
  rel="stylesheet"
/>
```

Then in your global CSS:

```css
body {
  font-family: 'Inter', sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6,
.font-heading {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

## Usage rules for AI/LLM context

When building new screens or components for this app:

1. **Always use tokens** — never hardcode hex values; reference `Colors.Primary` etc.
2. **Always pair status with Bahasa Indonesia label** — see word bank
3. **Default to flat surfaces** — no shadows unless it's a floating element (modal, sheet, FAB)
4. **Primary actions are green and full-width on mobile**
5. **Use badges for status, never icons alone** — colored backgrounds make scanning easier
6. **Stack actions vertically on mobile** — primary on top, secondary below
7. **Body text is 14px, headings step up from 16px in 2px increments**
8. **Spacing is always a multiple of 4** — never 5, 10, or other ad-hoc values
9. **Touch targets minimum 44x44px** — applies to all tappable elements
10. **Loading states use skeletons for content, spinners only for actions**

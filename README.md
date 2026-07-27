# Personal Expense Tracker

A cross-platform personal finance tracking application built with a **Turborepo** monorepo. Record daily income and expenses, organize transactions by category, and gain visual insights through interactive charts — all synced seamlessly across devices via Supabase.

| Platform | Stack |
|---|---|
| **Web** | Next.js 14+ (App Router), React 19, Tailwind CSS, Recharts |
| **Mobile** | React Native, Expo SDK 54, Expo Router v6, NativeWind |
| **Backend** | Supabase (PostgreSQL 15, Auth, Storage, Realtime) |
| **Monorepo** | Turborepo, pnpm workspaces |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Web Framework** | Next.js 14+ (App Router), Server + Client Components |
| **Web Styling** | Tailwind CSS 3.x |
| **Web Charts** | Recharts 2.x (`PieChart`, `BarChart`) |
| **Mobile Framework** | Expo SDK 54, React Native 0.81 |
| **Mobile Navigation** | Expo Router v6 (file-based routing) |
| **Mobile Styling** | NativeWind (Tailwind for React Native) |
| **Language** | TypeScript 5.x (strict mode) |
| **Package Manager** | pnpm workspaces |
| **Backend / DB** | Supabase, PostgreSQL 15 |
| **Auth** | Supabase Auth (Email/Password, Google OAuth) |
| **Storage** | Supabase Storage (receipt images) |
| **Realtime** | Supabase Realtime (live dashboard updates) |
| **Server State** | TanStack Query v5 |
| **Client State** | Zustand (auth, UI toggles, date filters) |
| **Forms** | React Hook Form + Zod validation |
| **Linting** | ESLint + Prettier |

---

## Project Structure

```
expense-tracker/
├── apps/
│   ├── web/                        # Next.js application
│   │   ├── src/
│   │   │   ├── app/                # App Router pages
│   │   │   ├── components/         # Web-specific components
│   │   │   ├── hooks/              # Web-specific hooks
│   │   │   └── lib/                # Supabase client, utilities
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   └── next.config.ts
│   └── mobile/                     # React Native / Expo application
│       ├── src/
│       │   ├── app/                # Expo Router pages
│       │   ├── components/         # Mobile-specific components
│       │   ├── hooks/              # Mobile-specific hooks
│       │   └── lib/                # Supabase client, utilities
│       ├── app.json
│       └── tailwind.config.ts
├── packages/
│   ├── shared/                     # Zod schemas, TS types, constants, helpers
│   │   └── src/
│   │       ├── types/              # Database types, API types
│   │       ├── constants/          # Categories, payment methods, enums
│   │       ├── validators/         # Zod schemas (transaction, category, profile)
│   │       └── utils/              # Currency formatting, date helpers
│   └── ui/                         # Shared cross-platform components
│       └── src/
│           ├── Button.tsx
│           ├── Card.tsx
│           ├── Input.tsx
│           └── Modal.tsx
├── supabase/
│   ├── migrations/                 # Database migration files
│   ├── seed.sql                    # Predefined category seed data
│   └── config.toml                 # Supabase project configuration
├── turbo.json                      # Turborepo pipeline configuration
├── pnpm-workspace.yaml
├── package.json
├── SPEC.md                         # Full project specification
└── AGENTS.md                       # OpenCode agent instructions
```

---

## Features

### User Authentication & Security
- Email/password sign-up and sign-in
- Google OAuth integration
- JWT session management with refresh token rotation
- Row-Level Security (RLS) ensures users only see their own data
- Auto-created profile on sign-up via database trigger

### Transaction Management
- Create, read, update, and delete income/expense transactions
- Categorize transactions with pre-defined or custom categories
- Attach receipt images (camera on mobile, file picker on web)
- Full-text search on descriptions
- Filter by date range, transaction type, category, and payment method
- Optimistic UI updates with automatic rollback on error

### Category Management
- 10 pre-defined expense categories + 7 pre-defined income categories
- Create custom categories with emoji icons and color labels
- Edit and delete user-created categories
- Soft-block deletion of categories with active transactions

### Dashboard & Analytics
- Summary cards: Total Income, Total Expenses, Net Balance
- Expense breakdown donut chart (Recharts `PieChart`)
- Income vs. expense trend bar chart (Recharts `BarChart`)
- Date range presets: Today, This Week, This Month, This Year, Custom
- Real-time updates via Supabase Realtime subscriptions
- Pull-to-refresh on mobile

### Cross-Device Sync
- All data stored in Supabase PostgreSQL
- Seamless sync between web and mobile
- Offline-capable with optimistic mutations

---

## Local Development

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** 11.x: `npm install -g pnpm`
- **Expo Go** (mobile): [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) | [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Environment Setup

Create `.env.local` files with your Supabase project credentials from the [Supabase dashboard](https://supabase.com/dashboard/project/_/settings/api).

**`apps/web/.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

**`apps/mobile/.env.local`**:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> Expo SDK 54 requires the `EXPO_PUBLIC_` prefix for public environment variables. The mobile client falls back to `NEXT_PUBLIC_` if `EXPO_PUBLIC_` is not set.

### Commands

| Command | Description |
|---|---|
| `pnpm install` | Install all dependencies (workspace-wide) |
| `pnpm --filter web dev` | Start the Next.js web app at `http://localhost:3000` |
| `pnpm --filter mobile dev` | Start the Expo dev server (offline mode) |
| `pnpm typecheck` | Run TypeScript type checking across all packages |
| `pnpm lint` | Run ESLint + Prettier across all packages |
| `pnpm test` | Run all tests (Vitest + Jest) |
| `pnpm test:shared` | Run tests for `packages/shared` only |

---

## Database Migrations

### Run Migrations

Migrations are located in `supabase/migrations/`. Use the [Supabase CLI](https://supabase.com/docs/guides/cli) to apply them:

```bash
# Link your local project
supabase link --project-ref your-project-ref

# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase db push --db-url postgresql://...
```

### Seed Data

After migrations are applied, run the seed script to populate pre-defined categories:

```bash
supabase db reset  # applies migrations + seed.sql
```

Alternatively, execute `supabase/seed.sql` manually against your database.

---

## Scripts Reference

### Root (`package.json`)

| Script | Command |
|---|---|
| `dev` | `turbo dev` |
| `build` | `turbo build` |
| `lint` | `turbo lint` |
| `typecheck` | `turbo typecheck` |
| `test` | `turbo test` |

### Mobile (`apps/mobile/`)

| Script | Command |
|---|---|
| `dev` | `expo start --offline` |
| `start` | `expo start --offline` |
| `build` | `expo export` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit` |

---

## Deployment

### Web (Vercel)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

Configure environment variables in the Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Mobile (EAS Build)

```bash
# Install EAS CLI
pnpm add -g eas-cli

# Log in to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

Over-the-air updates can be published with `eas update` without App Store review.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Clients                              │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │   Next.js (Web)     │  │  React Native / Expo     │  │
│  │   SSR + Tailwind    │  │  (iOS + Android)         │  │
│  └────────┬────────────┘  └───────────┬──────────────┘  │
└───────────┼──────────────────────────────┼───────────────┘
            │  HTTPS / JWT                │  HTTPS / JWT
            ▼                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Backend                       │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Auth    │  │Storage │  │ Realtime │  │
│  │ (RLS)    │  │ JWT OAuth│  │ Receipt│  │  Live    │  │
│  │          │  │          │  │ Images │  │  Updates │  │
│  └──────────┘  └──────────┘  └────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

Four core tables:

- **`auth.users`** (Supabase-managed) — user accounts and authentication
- **`profiles`** — user profile data (name, avatar, currency). FK → `auth.users`
- **`categories`** — income/expense categories (pre-defined + custom). FK → `profiles`
- **`transactions`** — individual income/expense records with amount, type, category, date, receipt. FK → `profiles`, `categories`

All tables enforce RLS: `auth.uid() = user_id`.

---

## Project Status

**MVP Complete.** All three implementation phases are delivered:

- **Phase 1** — Monorepo scaffold, Supabase integration, auth (email + Google OAuth), RLS, profile settings
- **Phase 2** — Category management, transaction CRUD, receipt upload, search/filter, optimistic UI
- **Phase 3** — Dashboard with summary cards, Recharts donut + bar charts, date range filters, real-time updates

---

## License

Private — internal project.

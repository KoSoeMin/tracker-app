# Personal Expense Tracker — Project Specification v1.0 (MVP)

---

## Document Overview

| Field | Value |
|---|---|
| **Project Name** | Personal Expense Tracker |
| **Version** | 1.0 (MVP) |
| **Platforms** | Web (Next.js) + Mobile (React Native / Expo) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Audience** | Individuals tracking daily income/expenses with visual analytics |
| **Status** | Draft — subject to review |

---

## Table of Contents

1. [Executive Summary & Core Objectives](#1-executive-summary--core-objectives)
2. [Technical Architecture & Tech Stack](#2-technical-architecture--tech-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Core Features & Functional Requirements](#4-core-features--functional-requirements)
5. [Database Schema](#5-database-schema)
6. [API Layer & Route Design](#6-api-layer--route-design)
7. [Component Tree & UI Architecture](#7-component-tree--ui-architecture)
8. [State Management Patterns](#8-state-management-patterns)
9. [Security & Row-Level Security (RLS) Policies](#9-security--row-level-security-rls-policies)
10. [Error Handling Strategy](#10-error-handling-strategy)
11. [Testing Strategy](#11-testing-strategy)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [Deployment Strategy](#13-deployment-strategy)

---

## 1. Executive Summary & Core Objectives

The **Personal Expense Tracker** (v1.0) is a cross-platform financial tracking application that enables individuals to record daily income and expenses, organize transactions by category, and gain visual financial insights through interactive charts.

### Core Objectives

- **Simplicity:** Clean, intuitive UI with minimal friction for data entry.
- **Cross-Device Sync:** Seamless data synchronization between web and mobile via Supabase Realtime.
- **Privacy & Security:** Row-Level Security (RLS) ensures each user sees only their own data.
- **Visual Insight:** Donut and bar charts provide at-a-glance monthly spending analysis.
- **Offline Resilience:** Mobile app gracefully handles intermittent connectivity with optimistic UI updates.

### Non-Goals (v1.0)

- No budget/limit setting or spending alerts.
- No recurring transaction automation.
- No multi-currency conversion or investment portfolio tracking.
- No shared/family accounts.

---

## 2. Technical Architecture & Tech Stack

### Architecture Diagram (Conceptual)

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

### Technology Stack — Detailed

| Layer | Technology | Version / Notes |
|---|---|---|
| **Web Framework** | Next.js 14+ (App Router) | Server Components + Client Components; SSR for dashboard SEO |
| **Web Styling** | Tailwind CSS 3.x | Utility-first; dark mode support planned post-MVP |
| **Web Charts** | Recharts 2.x | Composable React charting; donut + bar chart support |
| **Mobile Framework** | React Native 0.76+ via Expo SDK 52+ | Managed workflow; EAS Build for deployment |
| **Mobile Navigation** | Expo Router | File-based routing mirroring Next.js conventions |
| **Mobile UI** | NativeWind (Tailwind for RN) | Shared Tailwind config between web and mobile |
| **Language** | TypeScript 5.x | Strict mode; shared types across packages |
| **Package Manager** | pnpm workspaces | Monorepo management |
| **Backend / DB** | Supabase | PostgreSQL 15; REST + GraphQL (pg_graphql) |
| **Auth** | Supabase Auth | Email/Password + Google OAuth + Apple OAuth |
| **Storage** | Supabase Storage | Receipt images; authenticated bucket |
| **Realtime** | Supabase Realtime | PostgreSQL replication for live dashboard updates |
| **State (Client)** | TanStack Query (React Query) v5 | Server-state caching; optimistic updates |
| **State (Global UI)** | Zustand | Lightweight client state for modals, filters, theme |
| **Form Handling** | React Hook Form + Zod | Schema validation on both client and server |
| **Testing (Web)** | Vitest + React Testing Library | Component + hook unit tests |
| **Testing (Mobile)** | Jest + React Native Testing Library | Component tests |
| **Testing (E2E)** | Playwright (Web) + Detox (Mobile) | Critical user flows |
| **Linting** | ESLint + Prettier | Shared config; lint-staged on commit |

---

## 3. Monorepo Structure

```
expense-tracker/
├── .github/
│   └── workflows/              # CI/CD pipelines
├── apps/
│   ├── web/                    # Next.js application
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # Web-specific components
│   │   │   ├── hooks/          # Web-specific hooks
│   │   │   └── lib/            # Supabase client, utilities
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   └── next.config.ts
│   └── mobile/                 # React Native / Expo application
│       ├── src/
│       │   ├── app/            # Expo Router pages
│       │   ├── components/     # Mobile-specific components
│       │   ├── hooks/          # Mobile-specific hooks
│       │   └── lib/            # Supabase client, utilities
│       ├── app.json
│       └── tailwind.config.ts
├── packages/
│   ├── shared/                 # Shared TypeScript types, constants, utilities
│   │   ├── src/
│   │   │   ├── types/         # Database types, API types
│   │   │   ├── constants/     # Categories, payment methods, enums
│   │   │   ├── validators/    # Zod schemas shared across apps
│   │   │   └── utils/         # Currency formatting, date helpers
│   │   └── package.json
│   ├── ui/                     # Shared UI component library
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   ├── config-eslint/          # Shared ESLint configuration
│   └── config-typescript/      # Shared TypeScript configuration
├── supabase/
│   ├── migrations/             # Database migration files
│   ├── seed.sql                # Seed data for predefined categories
│   └── config.toml             # Supabase project configuration
├── turbo.json                  # Turborepo pipeline configuration
├── pnpm-workspace.yaml
├── package.json
└── SPEC.md                     # This document
```

---

## 4. Core Features & Functional Requirements

### 4.1 User Authentication & Profile

#### Feature: Sign Up & Sign In

| Requirement | Details |
|---|---|
| Methods | Email/Password, Google OAuth, Apple OAuth |
| Email Verification | Required before full access; resend verification email option |
| Session | JWT-based; refresh token rotation; 7-day session persistence |
| Mobile | Expo AuthSession for OAuth; SecureStore for token persistence |

#### Feature: Password Management

| Requirement | Details |
|---|---|
| Reset Flow | "Forgot Password?" → email link → reset form → confirmation |
| Change Password | Requires current password verification |
| Rate Limiting | Max 3 password reset attempts per hour per email |

#### Feature: Profile Settings Page

| Requirement | Details |
|---|---|
| Fields | Full name, email (read-only after verification), avatar (upload), base currency |
| Currency Options | MMK, USD, EUR, SGD, JPY, THB, GBP, CNY, KRW |
| Avatar | Upload to Supabase Storage; max 2MB; auto-crop to 256×256 |
| Account Deletion | Soft-delete with 30-day grace period; triggers cleanup of all user data |

### 4.2 Transaction Management

#### Feature: Record Income & Expense

| Field | Type | Validation | Notes |
|---|---|---|---|
| Amount | Numeric(12,2) | Required > 0 | Displayed with user's currency symbol |
| Type | Enum | Required | `income` or `expense` |
| Category | UUID FK | Required | From user's categories (predefined + custom) |
| Date & Time | Timestamptz | Required, default now | User picks date + optional time |
| Payment Method | Enum | Optional, default "Cash" | Cash, Bank, Mobile Wallet, Credit Card |
| Description | Text | Optional, max 500 chars | Searchable in list view |
| Receipt | File upload | Optional, max 5MB | Image only; stored in Supabase Storage |

#### Feature: Receipt Attachment

- Upload via camera (mobile) or file picker (web + mobile).
- Image compression to ≤ 5MB before upload.
- Stored at path: `receipts/{user_id}/{transaction_id}.{ext}`.
- Preview thumbnail in transaction detail view.

#### Feature: CRUD Operations

| Operation | Implementation |
|---|---|
| **Create** | Optimistic insert → Supabase `INSERT` → rollback on error |
| **Read** | Supabase `SELECT` with filters; paginated (20 per page, cursor-based) |
| **Update** | Optimistic update → Supabase `UPDATE` → rollback on error |
| **Delete** | Confirmation modal → Supabase `DELETE` → cascade receipt file delete |

#### Feature: Transaction List & Search

| Capability | Details |
|---|---|
| Search | Full-text search on `description` column via Postgres `to_tsvector` |
| Filter by Date | Date range picker (start / end) |
| Filter by Type | `income` / `expense` / `all` toggle |
| Filter by Category | Multi-select dropdown of user's categories |
| Filter by Payment Method | Dropdown of payment methods |
| Sort | Date (newest/oldest), Amount (high/low) |
| Virtualization | FlatList (mobile) or `react-window` (web) for smooth scrolling |

### 4.3 Category Management

#### Pre-defined Categories (Seed Data)

| Type | Categories |
|---|---|
| **Expense** | Food & Dining, Transportation, Utilities, Shopping, Entertainment, Health, Education, Housing, Insurance, Subscriptions |
| **Income** | Salary, Freelance, Investments, Gifts, Refunds, Rental Income, Business |

#### Custom Categories

| Capability | Details |
|---|---|
| Create | Name, type (income/expense), icon (emoji picker or pre-defined icon set), color (color picker) |
| Edit | All fields editable |
| Delete | Soft-block if category has active transactions (reassign or confirm) |
| Max Categories | 50 per user (to keep UI manageable) |

### 4.4 Dashboard & Visual Analytics

#### Summary Cards

| Card | Calculation |
|---|---|
| **Total Income** | `SUM(amount) WHERE type = 'income' AND transaction_date IN range` |
| **Total Expenses** | `SUM(amount) WHERE type = 'expense' AND transaction_date IN range` |
| **Net Balance** | Total Income — Total Expenses |
| **Transaction Count** | `COUNT(*) WHERE transaction_date IN range` |

All cards update in real-time via Supabase Realtime subscription.

#### Interactive Charts

| Chart | Type | Description |
|---|---|---|
| **Expense Breakdown** | Donut (Recharts `<PieChart>`) | Percentage per expense category; clickable to filter list below |
| **Income vs. Expense Trend** | Bar (Recharts `<BarChart>`) | Grouped bars by day/week/month depending on range; dual color |
| **Cumulative Balance** | Line (Recharts `<LineChart>`) | Optional; shows running net balance over time |

#### Date Range Filtering

| Preset | Range |
|---|---|
| Today | Current day (00:00:00 → 23:59:59 local) |
| This Week | Monday → Sunday of current week |
| This Month | 1st → last day of current month |
| This Year | Jan 1 → Dec 31 of current year |
| Custom | User picks start and end date |

---

## 5. Database Schema

### Entity Relationship Diagram (Text)

```
auth.users (Supabase Managed)
    │
    │ 1:1
    ▼
profiles ────1:N──── categories
    │                   │
    │ 1:N               │ 1:N
    ▼                   ▼
transactions ───────────┘
```

### Table Definitions

#### 5.1 `profiles`

```sql
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  avatar_url  TEXT,
  currency    TEXT DEFAULT 'MMK' CHECK (char_length(currency) = 3),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### 5.2 `categories`

```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  type        transaction_type NOT NULL,
  icon        TEXT,                    -- emoji character or icon name
  color       TEXT,                    -- hex color code e.g. #FF5733
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_category_name UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
```

#### 5.3 `transactions`

```sql
CREATE TABLE transactions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount            NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type              transaction_type NOT NULL,
  payment_method    TEXT DEFAULT 'Cash',
  description       TEXT,
  receipt_url       TEXT,                     -- Supabase Storage path
  transaction_date  TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- Full-text search index
CREATE INDEX idx_transactions_description_fts
  ON transactions USING GIN (to_tsvector('english', COALESCE(description, '')));
```

---

## 6. API Layer & Route Design

### 6.1 Next.js API Routes (Web)

While Supabase client SDK is used directly from the browser with RLS, certain operations require server-side logic via Next.js API routes.

| Method | Route | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Server-side email sign-up with profile creation | Public |
| `POST` | `/api/upload/receipt` | Generate signed upload URL for receipt | JWT |
| `POST` | `/api/upload/avatar` | Generate signed upload URL for avatar | JWT |
| `DELETE` | `/api/account` | Initiate account deletion + data cleanup | JWT |
| `GET` | `/api/analytics/summary` | Aggregate income/expense for dashboard (supabase-js RPC) | JWT |
| `GET` | `/api/analytics/trend` | Time-series data for charts (supabase-js RPC) | JWT |

### 6.2 Supabase Edge Functions (Optional)

For compute-heavy or scheduled tasks:

| Function | Purpose |
|---|---|
| `send-monthly-report` | (Post-MVP) Email monthly spending summary |
| `delete-expired-accounts` | Cron: hard-delete accounts past their 30-day grace period |

### 6.3 React Native Query Patterns

All data fetching in both apps uses TanStack Query with a thin Supabase query builder wrapper.

```typescript
// packages/shared/src/types/transaction.ts
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  categoryId?: string;
  paymentMethod?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// packages/shared/src/queries/transactions.ts
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  summary: (range: DateRange) => ['summary', range] as const,
};
```

---

## 7. Component Tree & UI Architecture

### 7.1 Web Application — Route & Component Tree

```
app/
├── layout.tsx                      # Root layout: Supabase listener, theme provider
├── page.tsx                        # Redirect to /dashboard if authenticated, else /auth
│
├── (auth)/
│   ├── layout.tsx                  # Auth layout (centered card, no sidebar)
│   ├── login/page.tsx              # Login form
│   ├── register/page.tsx           # Register form
│   └── reset-password/page.tsx     # Password reset form
│
├── (dashboard)/
│   ├── layout.tsx                  # Dashboard layout: sidebar + header + main
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard home (summary cards + charts)
│   │
│   ├── transactions/
│   │   ├── page.tsx                # Transaction list with search + filters
│   │   ├── [id]/
│   │   │   └── page.tsx            # Transaction detail / edit
│   │   └── new/page.tsx            # New transaction form
│   │
│   ├── categories/
│   │   ├── page.tsx                # Category list (predefined + custom)
│   │   └── new/page.tsx            # Create custom category
│   │
│   └── settings/
│       └── page.tsx                # Profile settings (name, currency, avatar, delete)
│
└── not-found.tsx                   # 404 page
```

### 7.2 Dashboard Layout Component Tree

```
DashboardLayout
├── Sidebar
│   ├── Logo
│   ├── NavItem (Dashboard)
│   ├── NavItem (Transactions)
│   ├── NavItem (Categories)
│   ├── NavItem (Settings)
│   └── UserMenu
│       ├── Avatar
│       ├── UserName
│       └── SignOutButton
│
├── Header
│   ├── Breadcrumb
│   ├── DateRangeSelector (preset toggles + custom picker)
│   └── MobileMenuToggle
│
└── MainContent (slot)
    ├── SummaryCards
    │   ├── Card (Income)
    │   ├── Card (Expenses)
    │   ├── Card (Net Balance)
    │   └── Card (Count)
    │
    ├── ChartsGrid
    │   ├── DonutChartCard
    │   │   ├── PieChart (Recharts)
    │   │   └── Legend
    │   └── BarChartCard
    │       ├── BarChart (Recharts)
    │       └── Legend
    │
    └── RecentTransactionsList
        ├── TransactionRow (× N)
        └── ViewAllLink
```

### 7.3 Mobile Application — Expo Router Structure

```
app/
├── _layout.tsx                     # Root layout: auth gate, Supabase provider
├── index.tsx                       # Redirect based on auth state
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── reset-password.tsx
│
├── (tabs)/
│   ├── _layout.tsx                 # Bottom tab navigator
│   ├── dashboard.tsx               # Tab 1: Dashboard (summary + charts)
│   ├── transactions.tsx            # Tab 2: Transaction list
│   ├── add-transaction.tsx         # Tab 3: FAB / center button → form
│   ├── categories.tsx              # Tab 4: Category management
│   └── settings.tsx                # Tab 5: Profile settings
│
└── transaction/
    ├── [id].tsx                    # Transaction detail / edit
    └── new.tsx                     # New transaction (also accessible via tab)
```

---

## 8. State Management Patterns

### 8.1 State Architecture

| State Category | Tool | Rationale |
|---|---|---|
| **Server State** (transactions, categories, profile) | TanStack Query | Caching, deduplication, background refetch, optimistic updates |
| **Auth State** (session, user) | Supabase `onAuthStateChange` listener → Zustand | Needs to be available synchronously across the app |
| **UI State** (modals, sidebar open, theme) | Zustand | Simple, no boilerplate, works outside React tree |
| **Form State** | React Hook Form | Performant, minimal re-renders, integrates with Zod |
| **URL State** (filters, page, search query) | `useSearchParams` (Next.js) / `useLocalSearchParams` (Expo) | Shareable URLs on web; persistence on mobile |

### 8.2 Zustand Store Slices

```typescript
interface AuthStore {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
}

interface UIStore {
  sidebarOpen: boolean;
  dateRange: { preset: PresetKey; start?: Date; end?: Date };
  isFilterModalOpen: boolean;
  toggleSidebar: () => void;
  setDateRange: (range: Partial<UIStore['dateRange']>) => void;
  openFilterModal: () => void;
  closeFilterModal: () => void;
}
```

### 8.3 TanStack Query Optimistic Update Pattern

```typescript
// Example: Deleting a transaction
const deleteTransaction = useMutation({
  mutationFn: (id: string) =>
    supabase.from('transactions').delete().eq('id', id).throwOnError(),
  onMutate: async (deletedId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
    // Snapshot previous value
    const previous = queryClient.getQueryData(transactionKeys.lists());
    // Optimistically remove from cache
    queryClient.setQueryData(transactionKeys.lists(), (old: Transaction[]) =>
      old?.filter((t) => t.id !== deletedId)
    );
    return { previous };
  },
  onError: (_err, _id, context) => {
    // Rollback on error
    queryClient.setQueryData(transactionKeys.lists(), context?.previous);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  },
});
```

---

## 9. Security & Row-Level Security (RLS) Policies

### 9.1 RLS Policies — `profiles`

```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert handled by trigger only (no direct user insert)
CREATE POLICY "No direct profile insert"
  ON profiles FOR INSERT
  WITH CHECK (FALSE);
```

### 9.2 RLS Policies — `categories`

```sql
-- Users see only their own categories (including defaults by user_id IS NULL)
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own (non-default) categories
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id AND is_default = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

-- Users can delete their own (non-default) categories
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = FALSE);
```

### 9.3 RLS Policies — `transactions`

```sql
-- Users see only their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

### 9.4 Storage Policies — Receipt Bucket

```sql
-- Bucket: receipt-images (authenticated read/write)
CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (auth.role() = 'authenticated' AND owner_id = auth.uid());

CREATE POLICY "Users can upload own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND owner_id = auth.uid());

CREATE POLICY "Users can delete own receipts"
  ON storage.objects FOR DELETE
  USING (auth.role() = 'authenticated' AND owner_id = auth.uid());
```

---

## 10. Error Handling Strategy

### 10.1 Client-Side Error Boundaries

| Layer | Mechanism |
|---|---|
| **Route level** | Next.js `error.tsx` (web) / Expo ErrorBoundary (mobile) |
| **Component level** | React Error Boundary wrapper for chart components |
| **Query level** | TanStack Query `onError` callbacks — toast notifications |
| **Form level** | React Hook Form `errors` object — inline field validation messages |

### 10.2 Error Classification & User Feedback

| Error | User Message | Action |
|---|---|---|
| Network offline | "You're offline. Changes will sync when you reconnect." | Queue mutation; replay on reconnect |
| Supabase auth token expired | "Session expired. Please sign in again." | Redirect to login; preserve return URL |
| RLS policy violation (401) | "You don't have permission to perform this action." | Log out and re-authenticate |
| Supabase rate limit (429) | "Too many requests. Please wait a moment." | Retry with exponential backoff |
| Storage upload failure | "Failed to upload receipt. Please try again." | Retry button; fallback to local file |
| Generic 500 | "Something went wrong. Please try again." | Log error to console + (post-MVP) Sentry |

### 10.3 Optimistic UI & Rollback

Every mutation (create, update, delete) follows this pattern:

1. **Optimistic apply** — update the cache immediately.
2. **Background mutation** — send the request to Supabase.
3. **On success** — invalidate relevant queries to sync with server truth.
4. **On error** — rollback cache to snapshot, show error toast with "Retry" button.

### 10.4 Logging & Monitoring (Post-MVP)

- **Sentry** for error tracking (both web and mobile).
- **Supabase Logs** for database query analysis.
- **Custom `logger` utility** with levels: `debug`, `info`, `warn`, `error`; disabled in production except `error`.

---

## 11. Testing Strategy

### 11.1 Testing Pyramid

```
        ╱─────╲
       ╱  E2E  ╲         Playwright (web) + Detox (mobile)
      ╱─────────╲
     ╱Integration╲        Component + hook tests with mocked Supabase
    ╱─────────────╲
   ╱   Unit Tests   ╲     Pure functions: validators, formatters, utils
  ╱───────────────────╲
```

### 11.2 Test Categories

| Layer | Tool | Scope | Frequency |
|---|---|---|---|
| **Unit** | Vitest / Jest | Zod validators, currency formatters, date helpers, category constants | `pnpm test` — every commit |
| **Component** | React Testing Library | Individual components: Button, Card, TransactionRow, SummaryCard | `pnpm test` — every commit |
| **Hook** | `@testing-library/react-hooks` | Custom hooks: `useTransactions`, `useCategories`, `useSummary` | `pnpm test` — every commit |
| **Integration** | React Testing Library + MSW | Full page flows: create transaction, filter list, update category | `pnpm test:integration` — before push |
| **E2E (Web)** | Playwright | Complete user journeys: sign-up → create transaction → view dashboard | `pnpm test:e2e` — before deploy |
| **E2E (Mobile)** | Detox | Critical mobile flows: login, add expense, view chart | `pnpm test:e2e:mobile` — before build |

### 11.3 Mocking Strategy

- **Supabase client** mocked at the module level using `vi.mock('@supabase/supabase-js')`.
- **Supabase test helpers** — a factory that returns typed mock responses for `from().select()`, `from().insert()`, etc.
- **Auth session** — test utility to inject a mock JWT session into the Zustand auth store.

### 11.4 Test Example (Component)

```typescript
// __tests__/SummaryCard.test.tsx
import { render, screen } from '@testing-library/react';
import { SummaryCard } from '@/components/SummaryCard';

describe('SummaryCard', () => {
  it('formats income with currency symbol', () => {
    render(<SummaryCard title="Income" value={150000} currency="MMK" variant="income" />);
    expect(screen.getByText('150,000 MMK')).toBeInTheDocument();
  });

  it('displays negative net balance in red', () => {
    render(<SummaryCard title="Net Balance" value={-5000} currency="USD" variant="net" />);
    const card = screen.getByTestId('summary-card');
    expect(card).toHaveClass('text-red-600');
  });
});
```

### 11.5 Test Commands (Root `package.json`)

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:web": "cd apps/web && vitest run",
    "test:mobile": "cd apps/mobile && jest --passWithNoTests",
    "test:shared": "cd packages/shared && vitest run",
    "test:e2e": "cd apps/web && playwright test",
    "test:ci": "pnpm test && pnpm test:e2e"
  }
}
```

---

## 12. Implementation Roadmap

### Phase 1 (Week 1–2): Foundation & Authentication

- [x] Scaffold monorepo with Turborepo, pnpm workspaces.
- [x] Initialize `apps/web` (Next.js 14+ App Router + Tailwind).
- [x] Initialize `apps/mobile` (Expo SDK 54 + Expo Router + NativeWind).
- [x] Set up `packages/shared` with TypeScript types, Zod schemas, constants.
- [x] Configure Supabase project (database, auth providers, storage bucket).
- [x] Run migrations: `profiles`, `categories`, `transactions` tables.
- [x] Create DB trigger: auto-create profile on user sign-up.
- [x] Implement sign-up / sign-in / sign-out (Email/Password + Google OAuth).
- [x] Apply RLS policies for `profiles`.
- [x] Build basic profile settings page (name, currency selector).
- [x] Set up CI: lint → typecheck → test on push.

### Phase 2 (Week 3–4): Categories & Transactions

- [x] Seed pre-defined categories (10 expense + 7 income).
- [x] Build category management UI (list, create modal, edit, delete confirmation).
- [x] Build transaction creation form (shared Zod schema in `packages/shared`).
- [x] Implement receipt photo upload (camera + file picker).
- [x] Build transaction list view with:
  - [x] Infinite scroll pagination (cursor-based).
  - [x] Search by description.
  - [x] Filters: date range, type, category, payment method.
- [x] Implement transaction edit and delete with optimistic UI.
- [x] Apply RLS to `categories` and `transactions` tables.
- [x] Add Supabase Realtime subscriptions for transaction list live updates.

### Phase 3 (Week 5–6): Dashboard, Analytics & Deployment

- [x] Build summary cards with animated counters.
- [x] Integrate Recharts donut chart (expense breakdown by category).
- [x] Integrate Recharts bar chart (income vs. expense trend).
- [x] Implement date range filter toggles (Today, Week, Month, Custom).
- [x] Connect Realtime subscriptions for live dashboard updates.
- [x] Final UI/UX polish: loading skeletons, empty states, responsive breakpoints.
- [x] Accessibility pass: keyboard navigation, screen reader labels, color contrast.
- [x] Deploy web app to Vercel (production domain, environment variables).
- [x] Build mobile app with EAS Build for TestFlight (iOS) and internal testing (Android).
- [x] Run E2E tests on CI pipeline before deployment.

---

## 13. Deployment Strategy

### 13.1 Web (Next.js) — Vercel

| Aspect | Configuration |
|---|---|
| **Platform** | Vercel Pro (or Hobby for MVP) |
| **Domain** | `expense-tracker.vercel.app` (custom domain post-MVP) |
| **Environment Variables** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Preview Deployments** | Per branch; connected to GitHub |
| **Analytics** | Vercel Analytics (optional) |

### 13.2 Mobile (Expo) — EAS Build

| Platform | Distribution |
|---|---|
| **iOS** | TestFlight internal testing → App Store submission |
| **Android** | Internal testing track → Play Store |
| **Updates** | EAS Update for over-the-air JS/asset updates (no App Store review) |

### 13.3 Supabase

| Aspect | Configuration |
|---|---|
| **Project Tier** | Free tier (500 MB DB, 5 GB bandwidth, 50 MB storage) — sufficient for MVP |
| **Backups** | Daily backups enabled (Supabase Pro recommended post-MVP) |
| **Branching** | Supabase branching for preview deployments |

### 13.4 CI/CD Pipeline (GitHub Actions)

```
Trigger: push to main / PR to main
  ├── lint (ESLint + Prettier check)
  ├── typecheck (tsc --noEmit)
  ├── test (vitest + jest)
  ├── build (next build + expo export)
  ├── e2e (Playwright — web only)
  └── deploy (Vercel + EAS Build on main merge)
```

---

## Appendix A: Key Shared Types (`packages/shared/src/types`)

```typescript
// --- Database Row Types ---
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  payment_method: string;
  description: string | null;
  receipt_url: string | null;
  transaction_date: string;
  created_at: string;
}

// --- Extended Types with Joins ---
export interface TransactionWithCategory extends Transaction {
  categories: Pick<Category, 'name' | 'icon' | 'color'> | null;
}

// --- Dashboard Types ---
export interface MonthlySummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  transaction_count: number;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
  percentage: number;
}

export interface TrendDataPoint {
  date: string;
  income: number;
  expense: number;
}

// --- Enum Constants ---
export const PAYMENT_METHODS = ['Cash', 'Bank', 'Mobile Wallet', 'Credit Card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CURRENCIES = ['MMK', 'USD', 'EUR', 'SGD', 'JPY', 'THB', 'GBP', 'CNY', 'KRW'] as const;
export type Currency = (typeof CURRENCIES)[number];
```

## Appendix B: Key Zod Schemas (`packages/shared/src/validators`)

```typescript
import { z } from 'zod';
import { PAYMENT_METHODS } from '../constants';

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().uuid('Invalid category'),
  payment_method: z.enum(PAYMENT_METHODS).default('Cash'),
  description: z.string().max(500).optional(),
  receipt_url: z.string().url().optional(),
  transaction_date: z.string().datetime(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['income', 'expense']),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
});

export const profileSchema = z.object({
  full_name: z.string().max(100).optional(),
  currency: z.enum(['MMK', 'USD', 'EUR', 'SGD', 'JPY', 'THB', 'GBP', 'CNY', 'KRW']),
});
```

---

*End of Specification v1.0*

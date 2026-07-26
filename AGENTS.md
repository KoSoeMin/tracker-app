# AGENTS.md — OpenCode Instructions

## 1. Stack Summary
- **Monorepo**: Turborepo + pnpm workspaces
- **Web** (`apps/web`): Next.js 14+ App Router, Tailwind CSS, Recharts
- **Mobile** (`apps/mobile`): Expo SDK 52+, Expo Router, NativeWind
- **Shared** (`packages/shared`): Zod schemas, TS types, constants, helpers
- **UI** (`packages/ui`): Shared cross-platform components
- **Backend**: Supabase (PostgreSQL 15, Auth, Storage, Realtime)
- **State**: TanStack Query v5 (server), Zustand (auth/UI), React Hook Form (forms)

## 2. Core Constraints & Guardrails
- **DRY Types/Schemas**: Never duplicate types or Zod schemas in `apps/`. Define once in `packages/shared`. Shared types at `packages/shared/src/types/`, validators at `packages/shared/src/validators/`.
- **Database & RLS**: All Supabase queries must abide by RLS (`auth.uid() = user_id`). Every query must include `.eq('user_id', userId)` or rely on RLS policies. Never bypass RLS with `service_role` key client-side.
- **State Pattern**: TanStack Query for server state (optimistic updates via `onMutate`/`onError` rollback). Zustand for client-only state (auth session, UI toggles, date range filters). React Hook Form + Zod for form validation.
- **DB Schema**: Three core tables — `profiles` (FK→auth.users), `categories` (user_id FK, type CHECK income/expense), `transactions` (user_id FK, category_id FK, amount > 0, type CHECK). Enums: `transaction_type` ('income','expense').
- **Auth Flow**: Supabase `onAuthStateChange` listener → Zustand auth store. Auto-create profile row on sign-up via DB trigger. OAuth providers: Google, Apple.
- **Error Handling**: Every mutation must follow optimistic→snapshot→rollback pattern. Show toast on error with retry action.
- **Scope Control**: Only touch files within `apps/web/`, `apps/mobile/`, `packages/shared/`, `packages/ui/`, `supabase/migrations/`. Never edit `node_modules`, `.next/`, `.expo/`.
- **Charts**: Recharts only (`PieChart` for donut, `BarChart` for income/expense trend). Import from `recharts` package — no Chart.js.

## 3. Standard Execution Workflow
1. **Types/Schema First**: Add/validate Zod schemas + TS types in `packages/shared`
2. **Migrations**: Write Supabase migration in `supabase/migrations/` if schema changes
3. **Logic Layer**: Build hooks (`apps/*/src/hooks/`) or API routes (`apps/web/src/app/api/`)
4. **UI Layer**: Build components using `packages/ui/` primitives, app-specific in `apps/*/src/components/`

## 4. Code Quality & Verification
- **Lint**: `pnpm lint` (ESLint + Prettier) before every commit
- **Typecheck**: `pnpm typecheck` (tsc —noEmit) must pass
- **Test**: `pnpm test` (Vitest/Jest). Run `pnpm test:shared` when changing schemas
- **All commands must succeed** before marking task complete

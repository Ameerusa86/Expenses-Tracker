# ExpenseFlow - AI Coding Agent Instructions

## Architecture Overview

ExpenseFlow is a **Next.js 16** (App Router) expense tracking SaaS application using:

- **MongoDB** via Mongoose for data persistence
- **Better Auth** for authentication (email/password + OAuth with Google/GitHub)
- **Server Actions** for mutations, **API Routes** for data fetching
- **Tailwind CSS v4** + shadcn/ui components for styling
- **TypeScript** with strict mode enabled

### Key Architecture Decisions

1. **Dual Database Clients**: The project uses BOTH `mongodb` (native driver for Better Auth) AND `mongoose` (for application models). This is intentional:
   - `lib/auth.ts` uses native MongoDB client for Better Auth adapter
   - `lib/db.ts` uses Mongoose with connection caching for serverless
   - Always call `dbConnect()` before Mongoose operations

2. **Money Storage**: All monetary amounts are stored as **cents (integers)** to avoid floating-point precision issues:
   - Use `toCents()` / `fromCents()` from `utils/money.ts`
   - Database fields are `amountCents: number`
   - Negative = expense, Positive = income

3. **Authentication Pattern**:
   - `getUserId()` from `lib/auth.ts` retrieves authenticated user from session headers
   - Throws error if unauthenticated - always use in protected routes/actions
   - All server actions and API routes filter by `userId` for multi-tenancy

## Critical Patterns

### Server Actions (mutations)

Location: `app/actions/*.ts`

```typescript
'use server'
import { getUserId } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import mongoose from 'mongoose'

export async function createResource(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = schema.parse(input) // Zod validation

  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const doc = await Model.create([{ ...parsed, userId }], { session })
    await session.commitTransaction()
    return JSON.parse(JSON.stringify(doc[0])) // Serialize Mongoose doc
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}
```

**Critical**: Always use transactions for data integrity, always serialize with `JSON.parse(JSON.stringify())` to avoid Mongoose object serialization issues.

### API Routes (queries)

Location: `app/api/*/route.ts`

- Use for GET requests with pagination/filtering
- Server Actions for POST/PUT/DELETE
- Always check `getUserId()` and filter by `userId`
- Return `NextResponse.json()`

### Schemas & Validation

Location: `schemas/*.ts`

- Use Zod for runtime validation
- Separate `createSchema` and `updateSchema` (update fields are optional)
- Field naming: use `amountCents`, `accountId`, `categoryId` (matching MongoDB fields)

### Models

Location: `models/*.ts`

- Mongoose schemas with TypeScript interfaces
- All documents include `userId: Types.ObjectId` with index
- Use compound indexes: `{ userId: 1, date: -1 }` for performance
- Status enums: `'cleared' | 'pending' | 'reconciled'`

## Component Conventions

### UI Components

- Use shadcn/ui components from `components/ui/`
- Button variants: `default | destructive | outline | secondary | ghost | link`
- Always use `cn()` utility for className merging
- Responsive: use Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`)

### Layout Components

- `components/layout/sidebar.tsx`: Mobile-responsive with sheet overlay
- `components/layout/navbar.tsx`: Contains theme toggle and user avatar
- Route groups: `(dashboard)` for authenticated pages

## Development Workflow

### Running the Project

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

### Environment Variables Required

```
DATABASE_URL=mongodb+srv://...          # For Better Auth (native driver)
MONGODB_URI=mongodb+srv://...           # For Mongoose
MONGODB_DB=expenseflow                  # Database name
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Git Hooks

- **Husky** + **lint-staged**: Auto-formats `.ts`, `.tsx`, `.md`, `.css` with Prettier on commit
- ESLint runs before commit (configured in `eslint.config.mjs`)

## Common Tasks

### Adding a New Feature

1. Create Mongoose model in `models/` with `userId` field
2. Create Zod schemas in `schemas/`
3. Create server actions in `app/actions/` (use transaction pattern)
4. Create API route in `app/api/` if needed for queries
5. Create page in `app/` (use dashboard layout if authenticated)
6. Add UI components in `components/`

### Authentication

- Protected routes: Place in `app/(dashboard)/`
- Public routes: Place in `app/` root (e.g., `login/`, `register/`)
- Get current user: `await getUserId()` in server components/actions

### Working with Money

```typescript
import { toCents, fromCents, formatCurrency } from '@/utils/money'

const cents = toCents(99.99) // 9999
const dollars = fromCents(9999) // 99.99
const display = formatCurrency(9999) // "$99.99"
```

### Styling

- Tailwind v4 (PostCSS-based, no JIT config needed)
- Theme: Uses `next-themes` with dark mode support
- CSS variables in `globals.css` for theme colors
- Use `clsx` + `tailwind-merge` via `cn()` utility

## Integration Points

### Better Auth

- Handles user sessions, OAuth, email/password
- API endpoint: `app/api/auth/[...better-auth]/route.ts`
- Client: `lib/auth-client.ts` for frontend auth methods
- Server: `lib/auth.ts` for backend session validation

### MongoDB Connection

- Connection caching prevents serverless connection exhaustion
- Global cache: `global.mongoose` (see `lib/db.ts`)
- Always await `dbConnect()` before Mongoose operations

## Pitfalls to Avoid

1. **Don't forget `userId` filtering**: Security issue - always filter by authenticated user
2. **Don't use floating-point for money**: Use cents (integers) exclusively
3. **Don't skip `dbConnect()`**: Mongoose needs explicit connection in serverless
4. **Don't forget to serialize Mongoose docs**: Use `JSON.parse(JSON.stringify())` in server actions
5. **Don't mix database clients**: Use native MongoDB for Better Auth, Mongoose for app logic
6. **Don't forget transactions**: Use Mongoose sessions for data consistency

## File Structure Conventions

```
app/
  (dashboard)/         # Authenticated routes (uses dashboard layout)
  actions/            # Server actions (mutations)
  api/                # API routes (queries)
  [feature]/          # Feature pages (public or in dashboard)
components/
  layout/             # Shell, sidebar, navbar
  [feature]/          # Feature-specific components
  ui/                 # shadcn/ui components (don't modify directly)
lib/                  # Core utilities (auth, db, utils)
models/               # Mongoose schemas
schemas/              # Zod validation schemas
utils/                # Helper functions (money, ids, errors)
```

## Testing & Validation

- No test suite currently configured
- Validation happens at Zod schema level (runtime)
- Use `safeParse()` for API routes, `parse()` (throws) for server actions
- Error handling: Throw errors in server actions, catch in UI with try/catch

## Deployment Notes

- Designed for Vercel serverless deployment
- Mongoose connection pooling configured for serverless (`maxPoolSize: 10`)
- Better Auth uses native MongoDB driver (more efficient for auth operations)
- All environment variables must be set in deployment platform

# Naming Conventions

The Sentinel project strictly governs naming behaviors spanning the `app` clients and `packages` workspaces. Universal consistency reduces cognitive load across the entire ecosystem.

## Primary Formatting

1. **Clarity Over Brevity:** Naming declarations for functions, files, or structures **must** clarify the inner logic concisely.
2. **Consistency:** Preserve casing strategies consistently within ecosystem boundaries. 

## File Operations

The file ecosystem generally operates using `kebab-case` structures separated by their specific utility.

- **React / Next.js / Expo Components:** `kebab-case.tsx` (e.g., `user-profile.tsx`, `auth-button.tsx`)
- **Node.js / Hono API Controllers / Routes:** `kebab-case.ts` (e.g., `user-controller.ts`, `auth-routes.ts`)
- **Shared Helpers / Utilities:** `kebab-case.ts` (e.g., `date-formatter.ts`, `string-utils.ts`)
- **Dedicated Hooks:** Prefix hooks continuously with `use-` targeting `kebab-case` (e.g., `use-fetch-data.ts`)
- **Types / Interfaces:** Types isolated from logic utilize `kebab-case` bearing the `.types.ts` suffix (e.g., `user.types.ts`).

## Code Operations

The structures executed inside the codebase are subjected to specific type standards limiting confusion.

- **React Components:** Utilizes standard `PascalCase` syntax exclusively (e.g., `UserProfile`, `AuthButton`).
- **Standard Variables and Functions:** Maintains default logic using `camelCase` parameters (e.g., `getUserData`, `isLoggedIn`).
- **Interfaces and Types:** Uses standard `PascalCase` formats (e.g., `UserData`, `AuthResponse`). The conventions strictly **prohibit** leveraging prefixes like `I` (Avoid `IUserData`) or `T`.
- **Constants:** Restricted completely to uppercase `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`, `API_BASE_URL`).
- **Enumerations:** Dictates `PascalCase` behavior for the enum type parameter paired with either internal `PascalCase` or `UPPER_SNAKE_CASE` member formats.

## Endpoint Structures

- **RESTful Endpoints:** Endpoints defined across Hono server structures employ `kebab-case` pathways continuously (e.g., `/api/users/profile`, `/api/auth/login`).
- **GraphQL APIs:** Any Graph configurations employ `camelCase` naming conventions for queries natively.

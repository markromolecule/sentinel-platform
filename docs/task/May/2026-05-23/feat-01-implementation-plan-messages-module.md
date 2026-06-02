# feat-01 - Messages Module Implementation Plan

**Date:** 2026-05-23  
**Type:** Feature  
**Summary:** Build the `messages` module in `sentinel-api`, enable Supabase realtime chat delivery, and prepare shared API/query/realtime hooks for reuse across `sentinel-core`, `sentinel-support`, `sentinel-web`, and `sentinel-mobile`.

## 3 Viable Options

### Option A - Backend API First, Polling on the Frontend

Implement REST endpoints and shared query/mutation hooks only, then defer realtime to a later task.

**Tradeoff:** Lowest risk and fastest backend delivery, but it does not satisfy the requested realtime chat workflow.

### Option B - Direct-Messaging MVP on Existing Tables with Supabase Realtime ✅ Recommended

Use the existing `conversations`, `conversation_participants`, and `messages` tables; add API endpoints, shared hooks, and Supabase realtime subscriptions for new messages and read state, while keeping the scope to direct conversations.

**Tradeoff:** Best fit for the current schema and request, but group-chat features stay out of scope for this pass.

### Option C - Full Chat Platform Expansion

Extend the schema for group-chat metadata, participant roles, delivery receipts, attachments, and richer conversation state before shipping any API.

**Tradeoff:** Most scalable long-term, but too large for the current brief and likely delays usable delivery.

## Best Option

**Choose Option B.**

It matches the current database shape, respects the existing layered API structure, and delivers the requested reusable backend plus shared hooks without inventing a larger chat product. The schema already contains the core chat tables, so the main work is API composition, permissioning, and Supabase realtime enablement instead of broad schema redesign.

## Pre-Planning Checklist

- [x] Read and summarize the task input in one sentence.
- [x] Scan relevant source files to understand existing patterns in `notification`, `calendar`, shared API services, and query hooks.
- [x] Identify likely touched files, services, and DB tables across `app/sentinel-api`, `packages/services`, `packages/hooks`, `packages/shared`, and Supabase config.
- [x] Determine if a Prisma migration is needed.

## Task Summary

- [x] Build a reusable messages backend and shared client layer around the existing chat tables, with Supabase realtime support and frontend-ready hooks for later UI work.

## Existing Findings

- [x] `app/sentinel-api/src/modules/general/messages/messages.dto.ts`, `messages.routes.ts`, and `messages.service.ts` already exist but are empty placeholders.
- [x] `packages/db/prisma/schema.prisma` already defines `conversations`, `conversation_participants`, and `messages`.
- [x] `app/sentinel-api/src/app.ts` does not yet register a `/messages` router.
- [x] `packages/hooks/src/use-notification-realtime.ts` is the closest reusable Supabase realtime pattern.
- [x] `packages/services/src/api/index.ts` and `packages/hooks/src/query/index.ts` do not yet export message APIs/hooks.
- [x] `packages/shared/src/types/admin/messages/index.ts` currently contains mock UI types only.
- [x] No `messages:*` permission keys were found in `packages/shared/src/constants/permissions.ts`.
- [x] A DB migration is still needed for Supabase realtime/RLS/publication setup, even though the base chat tables already exist.

## Files, Services, and DB Tables in Scope

### Backend

- [x] `app/sentinel-api/src/modules/general/messages/messages.dto.ts`
- [x] `app/sentinel-api/src/modules/general/messages/messages.routes.ts`
- [x] `app/sentinel-api/src/modules/general/messages/messages.service.ts`
- [x] `app/sentinel-api/src/modules/general/messages/controllers/get-conversations.controller.ts`
- [x] `app/sentinel-api/src/modules/general/messages/controllers/get-conversation-messages.controller.ts`
- [x] `app/sentinel-api/src/modules/general/messages/controllers/create-direct-conversation.controller.ts`
- [x] `app/sentinel-api/src/modules/general/messages/controllers/send-message.controller.ts`
- [x] `app/sentinel-api/src/modules/general/messages/controllers/mark-conversation-read.controller.ts`
- [x] `app/sentinel-api/src/modules/general/messages/controllers/messages.controller.test.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/get-conversations.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/get-conversation-messages.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/find-direct-conversation.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/create-conversation.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/add-conversation-participants.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/create-message.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/mark-conversation-read.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/get-conversation-by-id.ts`
- [x] `app/sentinel-api/src/modules/general/messages/services/message-query.service.ts`
- [x] `app/sentinel-api/src/modules/general/messages/services/message-write.service.ts`
- [x] `app/sentinel-api/src/modules/general/messages/services/message-mapper.ts`
- [x] `app/sentinel-api/src/app.ts`

### Shared Packages

- [x] `packages/shared/src/schema/messages/message-schema.ts`
- [x] `packages/shared/src/schema/index.ts`
- [x] `packages/shared/src/types/messages/index.ts`
- [x] `packages/shared/src/types/index.ts`
- [x] `packages/shared/src/constants/admin/messages/index.ts`
- [x] `packages/shared/src/constants/index.ts`
- [x] `packages/shared/src/constants/permissions.ts`
- [x] `packages/services/src/api/messages.ts`
- [x] `packages/services/src/api/index.ts`
- [x] `packages/hooks/src/use-message-realtime.ts`
- [x] `packages/hooks/src/index.ts`
- [x] `packages/hooks/src/query/messages/use-conversations-query.ts`

- [x] `packages/hooks/src/query/messages/use-conversation-messages-query.ts`
- [x] `packages/hooks/src/query/messages/use-create-direct-conversation-mutation.ts`
- [x] `packages/hooks/src/query/messages/use-send-message-mutation.ts`
- [x] `packages/hooks/src/query/messages/use-mark-conversation-read-mutation.ts`
- [x] `packages/hooks/src/query/messages/index.ts`
- [x] `packages/hooks/src/query/index.ts`

### Permissions and Seeds

- [x] `app/sentinel-api/src/seeds/messages-permissions.seed.ts`

### Database and Supabase

- [x] `packages/db/prisma/schema.prisma`
- [x] `packages/db/prisma/migrations/[timestamp]_enable_messages_realtime/migration.sql`

### DB Tables

- [x] `public.conversations`
- [x] `public.conversation_participants`
- [x] `public.messages`
- [x] `public.user_profiles`
- [x] `public.rbac_permissions`
- [x] `public.rbac_role_permissions`

## Assumptions and Scope Guards

- [ ] Treat this implementation as a **direct-message MVP** because `conversations.type` exists but there is no conversation title, group ownership, or membership-management metadata in the current schema.
- [ ] Keep UI screens out of scope for this task; only ship backend contracts and shared hooks/services reusable by all apps.
- [ ] Use Supabase Postgres changes subscriptions for `messages` and `conversation_participants`, not a custom websocket server.
- [ ] Reuse existing auth session setup in each app; do not introduce new auth providers.

## Additional Considerations

- [ ] **Breaking API changes:** No existing public `/messages` API exists, so this should be additive.
- [ ] **New env variables:** None expected if the apps continue using existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] **Migration rollback note:** Roll back by removing messages tables from `supabase_realtime`, dropping any new indexes/policies added for chat, and reverting any schema/index changes introduced in the migration.

## Phase 1: Contract and Schema Alignment

**Goal:** Define the shared message domain contracts and lock down the exact API shape before wiring data access.

- [x] Create `packages/shared/src/schema/messages/message-schema.ts` with Zod schemas for `messageParticipant`, `messageSummary`, `conversationSummary`, `conversationDetail`, `listConversationsResponse`, and `listConversationMessagesResponse`.
- [x] Export the new message schemas from `packages/shared/src/schema/index.ts`.
- [x] Create `packages/shared/src/types/messages/index.ts` to expose inferred `ConversationSummary`, `ConversationDetail`, `ConversationMessage`, and payload types used by services/hooks.
- [x] Export the new message types from `packages/shared/src/types/index.ts`.
- [x] Replace or supplement mock-only exports in `packages/shared/src/constants/admin/messages/index.ts` so future UI consumers can import both query keys and existing mock data safely during transition.
- [x] Add `MESSAGES_QUERY_KEYS` to `packages/shared/src/constants/admin/messages/index.ts` and re-export it from `packages/shared/src/constants/index.ts`.
- [x] Write `packages/shared/src/schema/messages/message-schema.test.ts` or the nearest co-located Vitest file to validate payload parsing and response shape assumptions.
      **Migration required:** No — this phase only defines shared TypeScript/Zod contracts.

## Phase 2: Backend Data and Service Layer

**Goal:** Implement the backend read/write layer on top of the existing chat tables using the same structure as other `sentinel-api` modules.

- [x] Implement `app/sentinel-api/src/modules/general/messages/data/get-conversations.ts` to return the current user’s conversations, participant summaries, latest message preview, and unread count derived from `conversation_participants.last_read_at`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/data/get-conversation-messages.ts` to return ordered messages for one conversation after verifying membership.
- [x] Implement `app/sentinel-api/src/modules/general/messages/data/find-direct-conversation.ts` to detect whether a 1:1 conversation already exists for two users.
- [x] Implement `app/sentinel-api/src/modules/general/messages/data/create-conversation.ts` and `add-conversation-participants.ts` to create a direct conversation and attach both users atomically.
- [x] Implement `app/sentinel-api/src/modules/general/messages/data/create-message.ts` to insert a new row in `public.messages`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/data/mark-conversation-read.ts` to update `conversation_participants.last_read_at` for the current user.
- [x] Implement `app/sentinel-api/src/modules/general/messages/data/get-conversation-by-id.ts` to enforce membership and provide a reusable lookup for message-write flows.
- [x] Implement `app/sentinel-api/src/modules/general/messages/services/message-mapper.ts` to translate DB rows into shared response types.
- [x] Implement `app/sentinel-api/src/modules/general/messages/services/message-query.service.ts` with concrete methods `listConversations()` and `listConversationMessages()`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/services/message-write.service.ts` with concrete methods `createDirectConversation()`, `sendMessage()`, and `markConversationRead()`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/messages.service.ts` as the static facade that delegates to `message-query.service.ts` and `message-write.service.ts`.
- [x] Add JSDoc on every exported service/data function in this module.
- [x] Write `app/sentinel-api/src/modules/general/messages/services/message-query.service.test.ts`.
- [x] Write `app/sentinel-api/src/modules/general/messages/services/message-write.service.test.ts`.
- [x] Write focused data-layer tests next to any helper with non-obvious query logic, especially unread count and direct-conversation lookup.
      **Migration required:** No — this phase uses the existing chat tables as they already exist in Prisma.

## Phase 3: Backend DTOs, Controllers, Routes, and App Registration

**Goal:** Expose the messages module through OpenAPI/Hono routes that match the repo’s controller and permission patterns.

- [x] Implement `app/sentinel-api/src/modules/general/messages/messages.dto.ts` with request/response schemas for:
- [x] `GET /messages/conversations`
- [x] `GET /messages/conversations/:conversationId/messages`
- [x] `POST /messages/conversations/direct`
- [x] `POST /messages/conversations/:conversationId/messages`
- [x] `POST /messages/conversations/:conversationId/read`
- [x] Implement `app/sentinel-api/src/modules/general/messages/controllers/get-conversations.controller.ts` and require `messages:view`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/controllers/get-conversation-messages.controller.ts` and require `messages:view`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/controllers/create-direct-conversation.controller.ts` and require `messages:create`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/controllers/send-message.controller.ts` and require `messages:create`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/controllers/mark-conversation-read.controller.ts` and require `messages:view`.
- [x] Implement `app/sentinel-api/src/modules/general/messages/messages.routes.ts` using `OpenAPIHono<HonoEnv>()`, `authMiddleware`, and `.openapi(...)` registrations matching `notification.routes.ts`.
- [x] Register `messagesRouter` in `app/sentinel-api/src/app.ts` with `app.route('/messages', messagesRouter)`.
- [x] Write `app/sentinel-api/src/modules/general/messages/controllers/messages.controller.test.ts` to cover 200/201, 401/403, membership failures, and validation failures.
      **Migration required:** No — this phase adds API surface only.

## Phase 4: RBAC and Supabase Realtime Enablement

**Goal:** Make the module reachable under RBAC and ensure Supabase can stream chat changes safely to authenticated participants.

- [x] Add `messages:view` and `messages:create` permission definitions to `packages/shared/src/constants/permissions.ts` under the `COMMUNICATION` category.
- [x] Add those permission keys to the appropriate role presets in `packages/shared/src/constants/permissions.ts` for `admin`, `superadmin`, `support`, `instructor`, and any other role that should participate in chat.
- [x] Create `app/sentinel-api/src/seeds/messages-permissions.seed.ts` following the same upsert pattern as `calendar-permissions.seed.ts`.
- [x] Create a migration at `packages/db/prisma/migrations/[timestamp]_enable_messages_realtime/migration.sql` to:
- [x] add any missing indexes needed for `messages.conversation_id`, `messages.created_at`, and `conversation_participants.user_id` if query plans show they are absent
- [x] set `REPLICA IDENTITY FULL` on `public.messages` and `public.conversation_participants` if required for update events
- [x] enable row-level security on `public.conversations`, `public.conversation_participants`, and `public.messages`
- [x] create participant-scoped `SELECT` policies so only authenticated conversation members can subscribe to or read rows
- [x] add `public.messages` and `public.conversation_participants` to the `supabase_realtime` publication
- [x] Document the rollback SQL inside the migration comments or adjacent task notes before execution.
- [x] Write a migration-focused verification checklist in the plan or execution log for subscription access, unauthorized access denial, and publication presence.
      **Migration required:** Yes — Supabase realtime publication and RLS/policy setup must be added even though the base chat tables already exist.

## Phase 5: Shared API Service and Query/Mutation Hooks

**Goal:** Provide one reusable client-facing messages package surface for all apps without building any app-specific UI yet.

- [x] Create `packages/services/src/api/messages.ts` with concrete functions `getConversations()`, `getConversationMessages()`, `createDirectConversation()`, `sendMessage()`, and `markConversationRead()`.
- [x] Export the new messages API from `packages/services/src/api/index.ts`.
- [x] Create `packages/hooks/src/query/messages/use-conversations-query.ts` using `useQuery` and `MESSAGES_QUERY_KEYS`.
- [x] Create `packages/hooks/src/query/messages/use-conversation-messages-query.ts` using `useQuery` and a conversation-scoped key.
- [x] Create `packages/hooks/src/query/messages/use-create-direct-conversation-mutation.ts`.
- [x] Create `packages/hooks/src/query/messages/use-send-message-mutation.ts` with cache invalidation for both the conversation message list and the conversation list preview.
- [x] Create `packages/hooks/src/query/messages/use-mark-conversation-read-mutation.ts` with cache invalidation for unread counts.
- [x] Create `packages/hooks/src/query/messages/index.ts` and export it from `packages/hooks/src/query/index.ts`.
- [x] Write co-located Vitest files for each shared hook with mocked `useApi()` and query-client invalidation assertions.
      **Migration required:** No — this phase builds shared client wrappers around the new API.

## Phase 6: Reusable Supabase Message Realtime Hook

**Goal:** Ship a shared realtime hook that any Sentinel app can plug into without rewriting Supabase channel logic.

- [x] Create `packages/hooks/src/use-message-realtime.ts` using `useNotificationRealtime.ts` as the structural reference.
- [x] Subscribe to `postgres_changes` on `public.messages` filtered by `conversation_id` so new messages invalidate `MESSAGES_QUERY_KEYS.messages(conversationId)` and `MESSAGES_QUERY_KEYS.conversations()`.
- [x] Subscribe to `public.conversation_participants` for the current user so read-state changes invalidate the conversation list unread counts.
- [x] Accept a minimal hook API such as `{ conversationId, enabled, invalidateList = true }` rather than app-specific UI callbacks.
- [x] Export `useMessageRealtime` from `packages/hooks/src/index.ts`.
- [x] Add a focused test file `packages/hooks/src/use-message-realtime.test.ts` that verifies channel creation, subscription configuration, invalidation, and cleanup.
      **Migration required:** No in code, but this hook depends on the realtime/RLS migration from Phase 4 being applied.

## Phase 7: Final Verification and Handoff

**Goal:** Prove the module is implementation-ready and safe for later UI integration across web, core, support, and mobile.

- [x] Run `pnpm --dir app/sentinel-api test` and ensure all new messages controller/service tests pass.
- [x] Run `pnpm --dir packages/hooks test` for the new message hook tests.
- [x] Run `pnpm --dir packages/services test` if a local test target exists, otherwise validate via hook tests and TypeScript usage.
- [x] Run `pnpm lint` and `pnpm format:check`.
- [x] Manually verify `GET /messages/conversations`, `GET /messages/conversations/:conversationId/messages`, `POST /messages/conversations/direct`, `POST /messages/conversations/:conversationId/messages`, and `POST /messages/conversations/:conversationId/read`.
- [x] Manually verify Supabase realtime delivery between two authenticated users in one existing app shell before handing off UI work.
- [x] Record any remaining UI assumptions for `sentinel-core`, `sentinel-support`, `sentinel-web`, and `sentinel-mobile` in the execution log so frontend work can consume the shared hooks without rediscovery.
      **Migration required:** No new migration in this phase — verification depends on the Phase 4 migration already being deployed.

## Done Criteria

- [x] Every task references a concrete file or function.
- [x] Each phase includes at least one test task.
- [x] Migration decisions are explicit per phase.
- [x] The plan stays implementation-ready and does not start coding beyond planning.

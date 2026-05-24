# feat-01 - Connect Messages Frontend Implementation Plan

**Date:** 2026-05-24  
**Type:** Feature  
**Summary:** Connect the existing messages backend, shared hooks, realtime subscriptions, auth gating, and participant institution/status metadata to the `sentinel-web` messages UI so authenticated users can discover, open, and send cross-institution conversations reliably.

## 3 Viable Options

### Option A - Web-Only UI Wiring on Existing Contracts

Wire `app/sentinel-web` to the existing shared message hooks as-is, keep the current participant shape, and use the already available conversation/message endpoints without expanding backend payloads.

**Tradeoff:** Fastest delivery, but it does not fully satisfy the brief because institution and active/status context would still be incomplete in the conversation UI.

### Option B - Contract Alignment Plus Web Integration ✅ Recommended

Extend the messages participant payload to include institution and user status details already stored in `user_profiles` and related tables, then connect `sentinel-web` to the shared query/mutation/realtime hooks with proper auth and profile gating.

**Tradeoff:** Slightly broader than a pure UI task, but it is the best fit for the existing codebase and covers the actual data the frontend needs without introducing new infrastructure.

### Option C - Full Shared Messaging Workspace Rollout

Build a reusable messaging surface for `sentinel-web`, `sentinel-core`, and `sentinel-support` at the same time, including a shared participant directory, presence indicators, and route-level messaging shell abstractions.

**Tradeoff:** Most reusable long-term, but it adds coordination and UI scope that the current frontend connection task does not require.

## Best Option

**Choose Option B.**

The backend message module, shared service layer, shared hooks, and realtime hook already exist, so the main missing work is contract alignment and app integration. This option closes the functional gaps called out in `docs/connect-messages-frontend.md` while staying close to current repo patterns in `packages/hooks`, `packages/services`, `packages/shared`, and `app/sentinel-web`.

## Concrete Next Steps

1. Expand the message participant contract and backend query mapping to expose institution and status data needed by the UI.
2. Replace the placeholder `app/sentinel-web` messages page with a client flow that loads conversations, loads one conversation thread, sends messages, and subscribes to realtime updates.
3. Gate the page with existing auth/profile state so only authenticated users with a valid profile can access the module.
4. Reuse presence and profile data to show active/status signals in the conversation list and thread header.
5. Verify cross-user messaging, unread state refresh, and realtime delivery with focused Vitest coverage and a manual multi-user checklist.

## Pre-Planning Checklist

- [x] Read and summarize the task input in one sentence.
- [x] Scan relevant source files to understand existing patterns in `packages/hooks/src/query/messages`, `packages/services/src/api/messages.ts`, `packages/hooks/src/use-message-realtime.ts`, `packages/hooks/src/use-presence.ts`, `app/sentinel-api/src/modules/general/messages`, and `app/sentinel-web/src/features/messaging`.
- [x] Identify all files, services, and DB tables the task will touch.
- [x] Determine if a Prisma migration is needed.

## Existing Findings

- [x] `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx` is still a placeholder that only renders empty states.
- [x] Shared frontend hooks already exist in `packages/hooks/src/query/messages/*` and `packages/hooks/src/use-message-realtime.ts`.
- [x] The backend messages module already exposes conversation list, conversation messages, direct conversation creation, send message, and mark-as-read endpoints.
- [x] Message participants currently expose `userId`, `name`, `avatarUrl`, and `role`, but not institution or profile status.
- [x] `user_profiles` already contains `institution_id`, `status`, and `last_seen_at`, so the missing frontend data looks retrievable without a schema change.
- [x] `packages/services/src/api/users.ts` and `packages/hooks/src/query/users/use-profile-query.ts` already provide the authenticated user’s profile and institution context.
- [x] `packages/hooks/src/use-presence.ts` already provides a repo-native way to derive live active user state for the frontend.

## Files, Services, and DB Tables in Scope

### Frontend

- [x] `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx`
- [x] `app/sentinel-web/src/features/messaging/components/chat-list/chat-list-standard.tsx`
- [x] `app/sentinel-web/src/features/messaging/index.ts`
- [x] New co-located messaging UI files under `app/sentinel-web/src/features/messaging/` as needed for conversation list items, thread panel, composer, and auth/profile empty states

### Shared Hooks and Services

- [x] `packages/hooks/src/query/messages/use-conversations-query.ts`
- [x] `packages/hooks/src/query/messages/use-conversation-messages-query.ts`
- [x] `packages/hooks/src/query/messages/use-create-direct-conversation-mutation.ts`
- [x] `packages/hooks/src/query/messages/use-send-message-mutation.ts`
- [x] `packages/hooks/src/query/messages/use-mark-conversation-read-mutation.ts`
- [x] `packages/hooks/src/use-message-realtime.ts`
- [x] `packages/hooks/src/use-presence.ts`
- [x] `packages/hooks/src/query/users/use-profile-query.ts`
- [x] `packages/services/src/api/messages.ts`

### Shared Types and Backend

- [x] `packages/shared/src/schema/messages/message-schema.ts`
- [x] `packages/shared/src/types/messages/index.ts`
- [x] `packages/shared/src/constants/admin/messages/index.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/get-conversations.ts`
- [x] `app/sentinel-api/src/modules/general/messages/data/get-conversation-by-id.ts`
- [x] `app/sentinel-api/src/modules/general/messages/services/message-mapper.ts`
- [x] `app/sentinel-api/src/modules/general/messages/services/message-query.service.ts`
- [x] `app/sentinel-api/src/modules/general/messages/services/message-write.service.ts`
- [x] `app/sentinel-api/src/modules/general/messages/controllers/messages.controller.test.ts`
- [x] `app/sentinel-api/src/modules/general/messages/services/message-query.service.test.ts`

### DB Tables

- [x] `public.conversations`
- [x] `public.conversation_participants`
- [x] `public.messages`
- [x] `public.user_profiles`
- [x] `public.institutions`
- [x] `public.user_roles`
- [x] `public.roles`
- [x] `auth.users` / Prisma `users`

## Additional Considerations

- [x] **Breaking API changes:** Participant fields were expanded additively in the messages response; no breaking route change was introduced.
- [x] **New env variables:** No new environment variables were needed; the implementation reuses the existing Supabase and API environment variables already used by `sentinel-web`.
- [x] **Migration rollback note:** No schema migration was needed for this implementation.

### Phase 1: Message Contract and Data Alignment

**Goal:** Make the messages API return the participant institution and profile status data the frontend needs without inventing new tables or auth flows.

- [x] Update `packages/shared/src/schema/messages/message-schema.ts` so `messageParticipantSchema` includes concrete frontend fields for institution identity and profile status, and define whether live `active` is API-backed or client-derived.
- [x] Update `packages/shared/src/types/messages/index.ts` to expose the expanded participant type used by the UI and shared hooks.
- [x] Update `app/sentinel-api/src/modules/general/messages/data/get-conversations.ts` to join `institutions` and select participant institution metadata plus profile status from `user_profiles`.
- [x] Update `app/sentinel-api/src/modules/general/messages/data/get-conversation-by-id.ts` if needed so newly created direct conversations return the same participant shape as the conversation list.
- [x] Update `app/sentinel-api/src/modules/general/messages/services/message-mapper.ts` to map the expanded participant payload consistently for both conversation summary and detail flows.
- [x] Update `app/sentinel-api/src/modules/general/messages/services/message-query.service.ts` and `app/sentinel-api/src/modules/general/messages/services/message-write.service.ts` only where the new participant contract affects returned data.
- [x] Write or extend `app/sentinel-api/src/modules/general/messages/services/message-query.service.test.ts` to cover institution/status mapping and cross-institution participant payloads.
- [x] Write or extend `app/sentinel-api/src/modules/general/messages/controllers/messages.controller.test.ts` to verify the response contract includes the new participant fields.
      **Migration required:** No — required participant metadata already exists in `user_profiles`, `institutions`, `user_roles`, and `roles`.

### Phase 2: Shared Hook Readiness and Frontend Consumption Rules

**Goal:** Confirm the shared hooks and client contracts are sufficient for a real chat screen and tighten any behavior gaps before the page uses them.

- [x] Review `packages/hooks/src/query/messages/use-conversations-query.ts` and keep it conversation-list focused, including any select/sort assumptions the page will rely on.
- [x] Review `packages/hooks/src/query/messages/use-conversation-messages-query.ts` to ensure empty `conversationId` and authenticated-query gating work cleanly for the page’s initial state.
- [x] Update `packages/hooks/src/query/messages/use-send-message-mutation.ts` to document or enforce message composer expectations such as trimmed content and post-send cache behavior if the page needs it.
- [x] Review `packages/hooks/src/query/messages/use-mark-conversation-read-mutation.ts` so unread-count refresh happens at the right UI moment after thread selection.
- [x] Review `packages/hooks/src/use-message-realtime.ts` to ensure conversation-level and list-level invalidation matches the intended page behavior.
- [x] Decide in `packages/hooks/src/use-presence.ts` and the plan notes that live `active` state should come from Supabase presence plus `last_seen_at` fallback, not a new persisted message-specific field.
- [x] Write or extend `packages/hooks/src/query/messages/use-conversations-query.test.ts` for authenticated enabling and conversation-list fetch behavior.
- [x] Write or extend `packages/hooks/src/query/messages/use-conversation-messages-query.test.ts` for selected-thread loading behavior.
- [x] Write or extend `packages/hooks/src/query/messages/use-send-message-mutation.test.ts` for composer success/error invalidation behavior.
- [x] Write or extend `packages/hooks/src/use-message-realtime.test.ts` for list invalidation, thread invalidation, and cleanup behavior used by the page.
      **Migration required:** No — this phase only aligns existing shared hooks and tests with the intended frontend flow.

### Phase 3: Protected Messages Page and Messaging UI Composition

**Goal:** Replace the placeholder page with a fully wired messages screen that loads conversations, opens threads, and sends messages.

- [x] Replace the placeholder logic in `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx` with a client page that uses `useProfileQuery()`, `useConversationsQuery()`, `useConversationMessagesQuery()`, `useSendMessageMutation()`, and `useMarkConversationReadMutation()`.
- [x] Add a concrete selection state flow in `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx` so the first available conversation can be opened safely and the empty state still renders when no chats exist.
- [x] Refactor `app/sentinel-web/src/features/messaging/components/chat-list/chat-list-standard.tsx` or split it into smaller files under `app/sentinel-web/src/features/messaging/components/` for a conversation list, conversation item row, thread header, message list, and composer.
- [x] Add a conversation-search UI in `app/sentinel-web/src/features/messaging/components/chat-list/chat-list-standard.tsx` or a new nearby component that filters already-fetched conversations client-side before a server-side search is added.
- [x] Add message-thread rendering in `app/sentinel-web/src/features/messaging/components/` that distinguishes current-user messages from participant messages and displays created timestamps.
- [x] Add composer submission handling in `app/sentinel-web/src/features/messaging/components/` that disables while sending, clears on success, and surfaces send failures through the existing mutation behavior.
- [x] Export any new messaging UI primitives from `app/sentinel-web/src/features/messaging/index.ts`.
- [x] Create co-located component tests under `app/sentinel-web/src/features/messaging/components/` for conversation selection, empty states, and send-message interactions.
      **Migration required:** No — this phase is page wiring and component composition only.

### Phase 4: Auth, Profile, Institution, and Access-State Handling

**Goal:** Ensure only authenticated users with usable profile context can access the messages module and that the UI reflects institution and user state clearly.

- [x] In `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx`, block data loading until `useProfileQuery()` confirms the authenticated user and their profile are available.
- [x] In `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx`, render a concrete empty/error state when the authenticated user is missing a profile or institution assignment instead of showing a broken chat shell.
- [x] In the relevant messaging UI components under `app/sentinel-web/src/features/messaging/components/`, display each participant’s institution and backend profile `status` from the expanded message contract.
- [x] In the relevant messaging UI components under `app/sentinel-web/src/features/messaging/components/`, combine `usePresence()` with backend profile status and `last_seen_at` fallback rules to show whether a user is active, offline, or inactive without changing persistence rules.
- [x] Review `app/sentinel-api/src/middleware/auth.ts` and `app/sentinel-api/src/modules/general/messages/controllers/*.ts` during implementation to confirm the frontend assumptions about authenticated access and institution context match what the API already enforces.
- [x] Add or extend page/component tests under `app/sentinel-web/src/features/messaging/components/` to cover unauthenticated wait states, missing-profile states, and institution/status display rules.
      **Migration required:** No — auth and institution context already exist in current middleware and profile tables.

### Phase 5: Realtime, Read State, and Multi-User Verification

**Goal:** Make the connected messages page feel live and trustworthy for message delivery, read refresh, and participant status changes.

- [x] Integrate `packages/hooks/src/use-message-realtime.ts` into `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx` so the selected thread and conversation list stay current while the page is open.
- [x] Connect thread-selection behavior in `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx` to `useMarkConversationReadMutation()` so unread counts are cleared when a conversation is actually viewed.
- [x] Verify that message sends through `packages/hooks/src/query/messages/use-send-message-mutation.ts` trigger the expected list and thread cache refreshes without duplicate rendering in the page.
- [x] Verify that `packages/hooks/src/use-presence.ts` and the messages page lifecycle do not leave stale channels behind when the route unmounts or when the selected conversation changes.
- [x] Add or extend `packages/hooks/src/use-message-realtime.test.ts` and any relevant web component tests to cover subscription-driven invalidation and cleanup.
- [ ] Add a manual verification checklist in the implementation log for two authenticated users from different institutions, covering conversation creation, message send, realtime receipt, unread count updates, and visible institution/status labels.
      **Migration required:** No — the required realtime migration already exists and this phase validates usage, not schema.

## Done Criteria

- [x] Every task references a concrete file or function.
- [x] Each phase has at least one test task.
- [x] Migration decision is explicit in every phase.
- [x] No task is vague; each one targets a specific contract, hook, page, or UI component.
- [x] The plan clearly distinguishes backend profile `status` from client-derived live `active` presence.
- [ ] The plan flags that cross-institution messaging must be verified with real participant payloads, not just same-institution test data.

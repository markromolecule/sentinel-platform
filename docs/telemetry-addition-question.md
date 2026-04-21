**What's already solid:** the 1-3-1 decision structure is good, the scope corrections are accurate, and the phase ordering is defensible. The plan is directionally correct and avoids the usual traps (rewriting rather than layering, over-engineering v1).

**What needs to be tightened before work starts:**

The biggest unresolved issue is the settings caching strategy in Phase 4. The plan says "loads support-managed settings once per request path where needed" but telemetry ingestion is a high-throughput path. Hitting `system_settings` on every event batch is a real performance concern. This needs a concrete decision: per-request DB read, in-memory TTL cache, or a module-level singleton refreshed on a timer. That choice affects how Phase 2's data access layer is structured.

The second blocking gap is that Phase 6 still has an open architectural decision: "Decide where the first MediaPipe integration lands." That decision should happen before Phase 1, not during Phase 6, because it determines which fields are required in the shared schema. If the answer is "no runtime integration in v1," the `emitDuringExam` and `captureDuringCheckup` fields can be schema-present but functionally inert. If student checkup is included, several additional event types and integration points need to be designed. Leaving this open until Phase 6 risks a schema revision that requires touching Phase 1 output.

`flushRequiresSecret` in the operations schema is undefined. What secret, stored where, checked how? If this is a manual flush endpoint protected by a shared secret, that's a security design that needs its own section. If it's vestigial, remove it.

`PUT /telemetry/settings` semantics are unspecified. Full-replace is simpler but dangerous on a deeply nested blob — a client that only wants to toggle `mediaPipe.enabled` would need to re-send the entire settings object. Partial merge (`PATCH`-style semantics on a `PUT`) is safer but needs to define merge depth. The DTO and service layer both depend on this.

Phase 3's permission mapping says "map permissions into the relevant role blueprints" without specifying which roles get which permissions. That's a decision that should be made explicit now: likely superadmin gets all four, support gets `view_settings`, `update_settings`, and `view_health`, read-only support gets `view_incidents` only. Leaving it implicit creates role-creep risk.

Phase 5's "show non-blocking warnings when overrides conflict with exam-level rules" has no backend mechanism behind it. The UI can't derive this on its own — either a conflict-check endpoint needs to exist, or the precedence rules need to be documented well enough that the frontend can compute warnings from the settings payload alone. One of those two needs to be in scope.

The `telemetryEventOverrideSchema` is conditionally defined ("only if needed"). Resolve this in Phase 1 rather than leaving it open. The ambiguity will cause a schema PR discussion mid-sprint.

The execution order at the bottom (10 steps) doesn't map cleanly to the 8 phases — steps 4 and 5 (services and hooks) aren't their own phase, they're buried inside Phase 5's task list. This creates sprint planning confusion. Either collapse them into Phase 5 explicitly, or promote them to Phase 4.5.

Phase 8 testing has no coverage for the layered precedence algorithm itself — the `system defaults → exam config → runtime telemetry decision` path is the most complex piece of this feature and should have dedicated integration tests that prove each layer correctly overrides or defers to the one above it.**The two decisions that need to be locked before any code is written:**

First, MediaPipe integration scope. Go with "schema-present, enforcement no-op in v1" and document it as the explicit choice. This unblocks Phase 1 from needing to hold for a design conversation.

Second, the settings cache strategy. Define a module-level singleton with a 30-second TTL that invalidates on any successful `PUT /telemetry/settings` write. This is simple, doesn't require Redis, and is safe to replace later. Specify it in Phase 2 alongside the data access helpers so Phase 4 has a concrete contract to wire against.

With those two locked, every other gap is a clarification or a missing task — nothing that blocks the phase structure itself. The plan is ready to execute once those are resolved.
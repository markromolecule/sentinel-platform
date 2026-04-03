# Exam + Question Backend Phased To-Do

## 1-3-1 Analysis

### One Goal
- Stabilize the backend `exam` and `question` modules first, before expanding more work into `question-bank` integration.

### Three Viable Options

#### Option 1: Wide Implementation Pass
- Touch controllers, DTOs, services, data helpers, and app integration for both modules in one sweep.

Pros:
- Fastest visible progress.

Cons:
- Harder to isolate regressions.
- Makes debugging noisy because multiple concerns change together.

#### Option 2: Phased Backend Hardening Per Concern
- Lock request/response contracts first.
- Add service-level validation next.
- Add focused tests per module before broader integration.

Pros:
- Best fit for easier debugging later.
- Keeps each phase scoped to one clear concern.
- Matches the repo’s modular backend direction.

Cons:
- Slightly slower than a wide pass.

#### Option 3: Full Exam + Question + Question-Bank Expansion
- Treat all assessment content modules as one backend milestone and wire everything together now.

Pros:
- Maximizes feature surface immediately.

Cons:
- Too wide for safe debugging.
- Higher risk of hidden cross-module issues.

## Recommended Option

### Option 2
- We keep the work phased so exam and question behavior can be verified independently.
- We limit each file change to one concern where possible.
- We postpone broader question-bank expansion until exam/question flows are stable.

## To-Do Workflow

### Phase 1: Contract Lock
- [x] Inspect existing `exam` and `question` backend structure.
- [x] Confirm the current route, DTO, service, and data boundaries.
- [x] Tighten any request contracts that can still leak invalid values into the DB layer.

### Phase 2: Exam Validation
- [x] Add service-level schedule validation for exam create and update flows.
- [x] Keep exam validation separate from persistence helpers.
- [x] Verify invalid timelines fail early with clear errors.
- [x] Reject duplicate section and question identifiers/order indexes before writing exam structure data.
- [x] Move exam configuration contracts, services, and routes into the dedicated `configuration` module so `exams` only consumes configuration behavior.

### Phase 3: Question Stability
- [x] Verify question content validation remains aligned with shared schemas.
- [x] Add focused tests around question validation or mapping behavior.
- [ ] Avoid mixing question-bank collection behavior into question CRUD work.

### Phase 4: Verification
- [x] Run targeted API TypeScript verification.
- [x] Run focused backend tests for exam/question behavior.
- [ ] Capture any later follow-ups for question-bank and publishing workflows as a separate phase.

## Current Scope Guardrails
- Only touch `exam` and `question` backend work in this pass.
- Prefer focused helpers over large service rewrites.
- Defer question-bank expansion to a later debugging cycle.

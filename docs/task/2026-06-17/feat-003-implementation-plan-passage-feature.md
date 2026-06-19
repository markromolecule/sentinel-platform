# Implementation Plan - Passage Feature Enhancement (v2)

> **Why this version exists:** the v1 plan was directionally correct but left several
> security- and consistency-critical decisions implicit (sanitizer allow-list, plain
> vs. html rendering rules, which surfaces actually read passage content, what
> "parity" between `sentinel-web` and `sentinel-core` means in practice). Those gaps
> are the most likely source of an LLM implementing this inconsistently across files.
> This version makes those decisions explicit or flags them as decisions to confirm
> before coding starts.

## Objective

Upgrade the question passage experience so instructors can author rich, student-facing
context with images, formatted text, and code snippets, instead of the current plain
`sourceEvidence` field. This must work end-to-end across question creation/editing in
`sentinel-web`, question bank management in `sentinel-core`, every exam runtime
rendering surface, and the shared schemas/API contracts/DB persistence that connect them.

---

## Before Writing Any Code: Confirm Against the Real Codebase

These are decisions the plan depends on, but that can't be answered from the plan
itself. Resolve each one by inspecting the actual repo before starting Phase 1 — do
not guess, and do not let `sentinel-web` and `sentinel-core` resolve them differently.

1. **Column naming convention.** Does `schema.prisma` use raw snake_case field names,
   or camelCase fields mapped to snake_case columns via `@map`? Match whatever the
   majority of existing columns already do — don't introduce a third convention.
2. **Existing sanitizer.** Is an HTML sanitization library already used anywhere in
   the stack (e.g. for other rich text fields, announcements, feedback)? If yes, reuse
   it and its existing allow-list module instead of adding a second sanitizer.
3. **Existing rich text editor.** Is an editor library already a dependency in either
   app? If yes, reuse it. If introducing one fresh, it must be the _same_ library,
   version, and configuration in both `sentinel-web` and `sentinel-core` — divergent
   editors will produce HTML the shared sanitizer/allow-list wasn't designed around.
4. **Upload endpoint.** What existing upload endpoint(s) exist, and what are their
   size/type constraints and storage backend? Reuse before adding a new one.
5. **Text column sizing convention.** Do other large text columns in this schema use
   unbounded `text`, or a capped `varchar(n)`? Decide whether `passage_content` needs
   an explicit max length enforced at the schema/validation layer.
6. **Full inventory of `sourceEvidence` readers.** Grep the codebase for every place
   `sourceEvidence` is read — not just exam-taking and preview. Likely candidates:
   review/results screens, PDF or print export, AI grading/analysis pipelines,
   question-bank search/indexing, accessibility/screen-reader paths. Every one of
   these becomes a rendering surface that Phase 4 must update consistently (see
   inventory table below).

---

## Recommended Product Decisions

1. Store authored passages as HTML in a dedicated `passage_content` column.
2. Keep a `passage_type` column with explicit values for rendering intent — `plain`
   for legacy content, `html` for rich authored content. Model this as a **closed
   enum** (validated by the shared zod schema), not a free string; reject unrecognized
   values at the API boundary rather than silently defaulting them.
3. Treat `sourceEvidence` as legacy student-facing passage content during rollout,
   never as the long-term editor storage format.
4. **Rendering behavior is keyed strictly off `passage_type`, never inferred from the
   shape of the content.** `plain` is always HTML-escaped and rendered as literal text
   (preserving line breaks); `html` is always sanitized, then rendered as markup. Do
   not attempt to detect "this looks like HTML" — that's an injection vector, not a
   feature.
5. The sanitizer allow-list (permitted tags, attributes, and URL schemes) lives in
   **one shared module in `packages/shared`**, imported by every rendering surface in
   both apps. No surface re-implements or hand-rolls its own allow-list.
6. Sanitize HTML before rendering on _every_ student- or instructor-facing surface
   that displays it (see inventory below) — not only the obvious "exam preview" path.
7. Reuse existing file upload infrastructure if available; do not store binary image
   data in the passage field.

---

## Rendering Surfaces Inventory

Fill this in against the actual codebase before Phase 4 is considered complete. Every
row that reads `sourceEvidence` or will read `passage_content` needs sanitize +
fallback behavior applied consistently.

| Surface                                   | Reads passage data? | Needs HTML sanitize?                     | Needs legacy fallback? |
| ----------------------------------------- | ------------------- | ---------------------------------------- | ---------------------- |
| Exam-taking screen (student)              | yes                 | yes                                      | yes                    |
| Exam preview (instructor)                 | yes                 | yes                                      | yes                    |
| Review / results screen (post-submission) | likely — confirm    | yes                                      | yes                    |
| PDF / print export                        | confirm if exists   | yes (or strip to plain text)             | yes                    |
| AI grading / analysis pipeline input      | confirm if exists   | strip to plain text, don't render markup | yes                    |
| Question bank search/indexing             | confirm if exists   | strip to plain text                      | yes                    |

If a confirmed surface is missing from this table, add it — don't silently skip it.

---

## Sanitization & Rendering Contract

This is the single algorithm every rendering surface must implement identically
(ideally by calling one shared helper rather than reimplementing the branching):

```
function renderPassage(question):
  if question.passageContent is non-empty:
    if question.passageType == "html":
      return sanitizeHtml(question.passageContent, SHARED_ALLOWLIST)   # rendered as markup
    else:  # "plain", null, or unrecognized — always treat as plain text
      return escapeHtml(question.passageContent), newlines -> <br>      # rendered as text, never markup
  elif question.sourceEvidence is non-empty:
    return escapeHtml(question.sourceEvidence), newlines -> <br>        # ALWAYS plain text, never interpreted as HTML
  else:
    return null   # no passage section rendered
```

**Starting allow-list** (confirm/adjust against actual design needs, then freeze it in
the shared module):

- [ ] Allowed: `h2`–`h4`, `p`, `br`, `strong`/`b`, `em`/`i`, `u`, `ol`/`ul`/`li`,
      `a` (href restricted to `http`/`https` only, `rel="noopener noreferrer nofollow"`
      enforced), `img` (`src` only, **`alt` mandatory**, no `style`, no inline event
      attributes), `code`/`pre` (optionally a `data-language` attribute for syntax
      highlighting), `blockquote`.
- [ ] Explicitly disallowed, no exceptions: `script`, `style`, `iframe`, `object`,
      `embed`, `form`, `svg`/`foreignObject`, any inline event-handler attribute
      (`onClick`, `onError`, etc.), and `javascript:`/`data:` URL schemes in any
      `href`/`src`.
- [ ] Defense in depth: sanitize on render (mandatory). Also decide explicitly whether to
      sanitize on write (recommended, since it protects every future reader including
      ones not yet written) — don't leave this unsanitized-at-rest by accident.

---

## Scope

### In scope

- [ ] Add passage columns to `exam_questions` and `question_bank_questions`.
- [ ] Extend shared question schemas and exam question types, including the closed
      `passage_type` enum.
- [ ] Persist passage data through API create/update/read flows.
- [ ] Add rich passage editing in instructor-facing builders (identical editor/config in
      both apps).
- [x] Render sanitized rich passages, via the shared contract above, on **every** surface
      identified in the Rendering Surfaces Inventory.
- [ ] Backfill or migrate legacy passage text where it already exists, idempotently.

### Out of scope for v1

- [ ] Reusable passage libraries or a separate `passages` table.
- [ ] Markdown authoring as a first-class storage format.
- [ ] Collaborative editing or version history for passages.
- [ ] Full WYSIWYG media management beyond basic image upload/link insertion.

---

## Implementation Phases

### Phase 1: Data Model and Shared Contracts

**Goal:** Make passage content a first-class part of the domain model.

- [x] Update `packages/db/prisma/schema.prisma`:
    - [x] Add `passage_content` (nullable text; confirm cap vs. unbounded per the "before
          starting" check) to `exam_questions` and `question_bank_questions`.
    - [x] Add `passage_type` (nullable, `@default("plain")`) to both models, matching
          existing naming convention exactly (raw vs. `@map`'d).
- [x] Update shared schemas in `packages/shared`:
    - [x] Extend `questionInputSchema` with `passageContent` and `passageType` (the latter
          as a zod enum of exactly `["plain", "html"]`, rejecting anything else).
    - [x] Extend `questionRecordSchema` with the same fields.
    - [x] Extend `createQuestionBodySchema` and `updateQuestionBodySchema`.
    - [x] Update `ExamQuestion` in `packages/shared/src/types/exams/exam.ts`.
    - [x] Add the shared sanitizer allow-list module described above (even if Phase 4 is
          where it's first consumed — defining it now keeps Phase 3/4 from improvising one).
- [x] Regenerate Prisma client and any derived shared/build artifacts.
- [x] Add schema tests covering: valid `html` payload, valid `plain` payload, an
      unrecognized `passageType` value (must be rejected), and an oversized payload if a
      cap was chosen.

**Definition of done:** migration applies cleanly to both a fresh DB and existing
data without dropping rows; `prisma validate` passes; all schema tests above pass.

### Phase 2: API Persistence and Mapping

**Goal:** Ensure the backend stores, reads, and copies passage content consistently.

- [x] Update question DTOs and mappers in `app/sentinel-api`:
    - [x] Include passage fields in create/update request bodies and response payloads.
    - [x] Map database columns to shared API types in question response serializers.
- [x] Update question persistence services:
    - [x] Save `passage_content` and `passage_type` on create and update.
    - [x] Preserve existing behavior for `sourceOrigin`, `sourceFileName`,
          `sourcePageNumber`, and `sourceEvidence` — these are not being removed in v1.
    - [x] Decide explicitly (per the sanitization contract) whether the write path also
          sanitizes, and implement that decision rather than leaving it unaddressed.
- [x] Update exam question creation/copy flows so questions cloned into an exam snapshot
      carry their passage fields too.
- [x] Update exam detail and session payload builders so runtime consumers receive the
      passage snapshot from `exam_questions`.
- [x] Add Vitest coverage for: create/update round trips, exam question snapshot
      propagation, and legacy fallback behavior when passage content is absent.

**Definition of done:** round-trip create→read returns equivalent content; a cloned
exam snapshot inherits passage fields; a legacy record with no `passage_content`
still serializes successfully.

### Phase 3: Instructor Builder UX

**Goal:** Let instructors author and edit passages without leaving the question builder.

- [x] Update the question builder in `app/sentinel-web`:
- [x] Add an optional, collapsible Passage section near the question prompt.
    - [x] Use **one** rich text editor library (per the "before starting" decision) that
          outputs HTML constrained to the shared allow-list.
    - [x] Support headings, lists, links, inline formatting, images (with mandatory alt
          text in the UI, not just the schema), and code blocks.
- [x] Keep the existing question prompt and answer content flow unchanged.
- [x] Update the question builder in `app/sentinel-core` with the **identical** editor
      library, version, and configuration — parity here means "produces the same HTML
      shape," not just "looks similar."
- [x] Update builder payload/state types and any import/export helpers that pass question
      data around.
- [x] Wire image insertion through the confirmed upload endpoint from the "before
      starting" check (new endpoint only if none suitable exists).
- [ ] Replace "validate pasted content can't break layout" with a concrete check: paste
      deeply nested lists, an oversized image, and a long unbroken string into the editor
      and confirm the builder layout doesn't overflow or break (visual/manual check). This
      is a UX safeguard, not a security control — the security boundary is the shared
      sanitizer in Phase 4, not anything client-side.

**Definition of done:** an instructor can author, save, and reload a passage
exercising each supported block type in both apps; image upload returns a stable URL;
both editors are confirmed to use the same library/config (not just visually similar).

### Phase 4: Exam Runtime Rendering

**Goal:** Render passages safely and consistently everywhere identified in the
Rendering Surfaces Inventory.

- [x] Implement the shared `renderPassage` contract above as one importable helper, used
      by every surface — do not let `sentinel-web` and `sentinel-core` each write their
      own branching logic.
- [x] Pick **one** syntax highlighting library for code blocks; confirm it doesn't `eval`
      or otherwise execute based on the language string; apply identical config in both apps.
- [x] Update `getExamContextDetails` and related runtime helpers to accept passage content
      and type instead of assuming the old reference field, and to apply the fallback
      algorithm above (never assume `sourceEvidence` is HTML).
- [x] Update every surface in the Rendering Surfaces Inventory, not only the exam-taking
      and preview screens.
- [x] Add tests for: sanitized HTML rendering of each allow-listed element, code block
      rendering, fallback rendering when passage content is missing, and — explicitly —
      attempted script injection, inline event-handler injection, and `javascript:`/
      `data:` URI injection in `href`/`src`, confirming none execute or render as live markup.

**Definition of done:** every inventoried surface renders via the shared helper;
legacy records with only `sourceEvidence` render as escaped plain text everywhere
(never as markup); injection test vectors above are all neutralized.

### Phase 5: Backfill, Cleanup, and Compatibility

**Goal:** Preserve existing content and reduce migration risk.

- [x] Create a one-time, **idempotent** migration/backfill script that copies legacy
      `sourceEvidence` text into `passage_content` (skip rows where `passage_content` is
      already set, so re-running the script is a no-op on already-migrated rows).
- [x] Run it in dry-run mode first (log row counts and a content diff sample) before the
      real run.
- [x] Mark backfilled rows as `passage_type = "plain"` (legacy text was never authored as
      HTML, so it must continue to be escaped, not rendered as markup).
- [x] Keep legacy `sourceEvidence` available and untouched until all affected read paths
      are confirmed migrated — this also doubles as the rollback plan: if something's
      wrong with the backfill, stop reading `passage_content` and the original data is
      still intact.
- [x] Remove any builder/runtime assumptions that still treat `sourceEvidence` as the
      primary authored passage source once the new fields are live.
- [x] Document the new contract (this file, or a derived doc) so future question features
      don't reintroduce passage text into unrelated fields.

**Definition of done:** running the backfill script twice produces identical state on
the second run; a spot-checked sample of migrated rows renders identically to how
they rendered via the old `sourceEvidence` path.

---

## Acceptance Criteria

- [ ] `passage_content` and `passage_type` (closed enum) exist in the database models for
      both question tables, following the project's existing naming convention.
- [ ] Shared schemas and API contracts expose and validate passage fields end-to-end.
- [ ] Instructors can create and edit rich passages in both `sentinel-web` and
      `sentinel-core` using the same editor/config.
- [ ] The shared sanitize/render contract is implemented once and consumed by every
      surface in the Rendering Surfaces Inventory — confirmed complete, not just the
      originally-assumed student/preview surfaces.
- [ ] Existing questions without new passage data still render correctly through the
      legacy fallback path, always as escaped plain text.
- [ ] Injection test vectors (script, event-handler, `javascript:`/`data:` URIs) are
      covered by automated tests and confirmed neutralized.
- [x] At least one backend test and one rendering test cover the new behavior.

## Verification Checklist

- [ ] Run the relevant test suites for shared schemas, API services, and frontend runtime
      components, including the injection test vectors above.
- [ ] Manually verify:
    - [ ] creating a question with passage content (each block type)
    - [ ] editing an existing passage
    - [ ] rendering images and code blocks in exam preview _and_ the review/results screen
    - [ ] opening an older question that only has legacy passage text
    - [ ] pasting a known-malicious snippet (e.g. a `<script>` tag, an `onerror` image
          attribute) into the editor and confirming it never renders as live markup anywhere
- [ ] Confirm no regressions in question serialization, import flows, exam snapshots, or
      any export/print path that touches passage content.

## Notes and Risks

- [ ] Because passages can contain user-authored HTML, sanitization is mandatory on every
      rendering path — "every" must be verified against the actual inventory, not assumed
      from the original "students and preview" framing.
- [ ] Treating `plain` content as HTML (or vice versa) is itself an injection vector if
      the type is ever inferred rather than read directly — the contract above forbids
      inference for this reason.
- [ ] If `sentinel-web` and `sentinel-core` use different editor or sanitizer
      configurations, their output will drift in ways that are hard to catch in review;
      centralizing both in `packages/shared` is the main defense against this.
- [ ] If the chosen editor stores URLs for uploaded media, those URLs must be stable and
      accessible in both preview and runtime contexts.
- [ ] If the backfill is skipped, legacy questions will still work only through fallback
      logic, which should be treated as temporary compatibility support rather than the
      final state.

## Implementation Notes

- `passageContent` is now the authored source of truth for rich passages, with
  `passageType` controlling rendering intent (`plain` or `html`).
- `sourceEvidence` remains as a legacy fallback only; runtime helpers and builders now
  prefer `passageContent` first and treat fallback content as escaped plain text.
- Both builder apps use the shared `PassageEditor` from `packages/ui`, and code blocks
  render through the shared lowlight-based configuration.
- Passage image uploads go through `POST /media/passage-images/upload`, which stores
  files in the configured Supabase storage bucket and inserts the returned public URL
  into the editor.
- Question editing mode now switches to a full-width canvas on desktop, keeps the
  passage in a dedicated right-hand column, and hides the exam-level `Save Draft` and
  `Publish` actions from the footer while moving the question-level `Cancel`,
  `Duplicate`, and `Save` actions into the builder header.
- The builder header now uses a separator to visually divide the title/action row from
  the question editor body, and the passage controls include a preview dialog that
  renders the current passage using the shared passage-rendering contract.
- In builder mode, the local question header is hidden so the editor starts at the
  same left alignment as the page chrome, with both columns rendered at equal width
  and stretched to the same height, without card wrappers around the main content.

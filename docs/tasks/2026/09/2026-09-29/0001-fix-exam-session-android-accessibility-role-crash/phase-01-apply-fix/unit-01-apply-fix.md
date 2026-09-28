---
title: "Unit 1.01 – Apply accessibilityRole Fix and Update Test"
type: unit
parent: "phase-01-apply-fix"
unit: "1.01"
branch: "task/0001/phase-01/unit-01-apply-fix"
worktree: ".worktrees/0001/phase-01/unit-01-apply-fix"
status: verified
created: "2026-09-29"
tags: [task, unit, fix, mobile, android, accessibility]
depends_on: []
parallelizable_with: []
---

# Unit 1.01 – Apply `accessibilityRole` Fix and Update Test

> Phase: phase-01-apply-fix · Depends on: none · Parallelizable with: none
> Worktree: `.worktrees/0001/phase-01/unit-01-apply-fix/` · Branch: `task/0001/phase-01/unit-01-apply-fix`

## Objective

Replace the invalid `accessibilityRole={"article" as any}` on the `PassageCard` outer `<View>` with the valid React Native value `"none"`, remove the TypeScript `as any` cast, and update the companion unit test assertion — eliminating the Android `RCTView` bridge crash at exam session entry.

---

## Context Packet

### Problem

On Android (Expo Go and `.apk`), entering any exam session that contains a reading passage crashes with:

```
Error while updating property 'accessibilityRole' of a view managed by: RCTView
null
Invalid accessibility role value: article
```

iOS silently ignores unknown `accessibilityRole` values. Android validates them strictly at the bridge level.

### Root Cause

**File:** `app/sentinel-mobile/features/exam/components/session/passage-card.tsx`  
**Line:** 63

```tsx
// BEFORE — INVALID on Android RCTView bridge
<View
    accessibilityRole={"article" as any}
    accessibilityLabel={`Reading passage: ${displayTitle}`}
```

`"article"` is an HTML/ARIA role. React Native's `AccessibilityRole` type union does **not** include `"article"`. The `as any` cast was used to suppress the TypeScript error, hiding the Android runtime crash.

### The Fix

```tsx
// AFTER — valid React Native role
<View
    accessibilityRole="none"
    accessibilityLabel={`Reading passage: ${displayTitle}`}
```

**Why `"none"`:** The outer `<View>` is a passive grouping container, not an interactive control. The `accessibilityLabel` already describes the passage region (`"Reading passage: <title>"`). Announcing a role in addition would be noise. `"none"` is the correct and honest React Native role for a decorative container.

### Companion Test

**File:** `app/sentinel-mobile/features/exam/components/session/passage-card.test.tsx`  
**Line:** 115

```ts
// BEFORE
expect((tree as any).props?.accessibilityRole).toBe('article');

// AFTER
expect((tree as any).props?.accessibilityRole).toBe('none');
```

The test at line 113–116 explicitly asserts the `accessibilityRole` of the outer container. It must be updated to match the corrected value — otherwise CI will fail on the unit test assertion.

### Acceptance Criteria This Unit Serves

| ID | Criterion |
|---|---|
| AC-1 | Exam session loads on Android without `RCTView` bridge error |
| AC-2 | `as any` cast removed; TypeScript compilation succeeds |
| AC-3 | Unit test assertion reflects `"none"` |
| AC-4 | No iOS regression — test suite still passes |

### Valid React Native `AccessibilityRole` Values (Reference)

`adjustable`, `alert`, `button`, `checkbox`, `combobox`, `grid`, `header`, `image`, `imagebutton`, `keyboardkey`, `link`, `list`, `listitem`, `menu`, `menubar`, `menuitem`, **`none`**, `progressbar`, `radio`, `radiogroup`, `scrollbar`, `search`, `slider`, `spinbutton`, `summary`, `switch`, `tab`, `tabbar`, `tablist`, `text`, `timer`, `togglebutton`, `toolbar`, `webview`.

Source: https://reactnative.dev/docs/accessibility#accessibilityrole

---

## Preconditions

- Git worktree provisioned: `git worktree add .worktrees/0001/phase-01/unit-01-apply-fix task/0001/phase-01/unit-01-apply-fix`
- Branch `task/0001/phase-01/unit-01-apply-fix` cut from `task/0001-fix-exam-session-android-accessibility-role-crash` (which is cut from `build-android-expo`).
- Working directory for all edits: `.worktrees/0001/phase-01/unit-01-apply-fix/`
- No dependency on prior units.

---

## Scope

**In scope:**
- `app/sentinel-mobile/features/exam/components/session/passage-card.tsx` — line 63 only.
- `app/sentinel-mobile/features/exam/components/session/passage-card.test.tsx` — line 115 only.

**Out of scope:**
- Any other file in the repository.
- Any other `accessibilityRole` usage (all confirmed valid by prior search).
- Refactoring `PassageCard`, `QuestionCard`, `ExamSessionScreen`, or any other component.
- Backend, web, or infrastructure code.

---

## Steps

1. **Provision the worktree and branch:**
   ```bash
   # From repo root
   git checkout build-android-expo
   git pull
   git checkout -b task/0001-fix-exam-session-android-accessibility-role-crash
   git checkout -b task/0001/phase-01
   git checkout -b task/0001/phase-01/unit-01-apply-fix
   git worktree add .worktrees/0001/phase-01/unit-01-apply-fix task/0001/phase-01/unit-01-apply-fix
   ```

2. **Navigate to the worktree:**
   ```bash
   cd .worktrees/0001/phase-01/unit-01-apply-fix
   ```

3. **Edit `passage-card.tsx` — line 63:**

   **Before:**
   ```tsx
   accessibilityRole={"article" as any}
   ```
   **After:**
   ```tsx
   accessibilityRole="none"
   ```

   Full context (lines 61–65):
   ```tsx
   return (
       <View
           accessibilityRole="none"
           accessibilityLabel={`Reading passage: ${displayTitle}`}
           style={{
   ```

4. **Edit `passage-card.test.tsx` — line 115:**

   **Before:**
   ```ts
   expect((tree as any).props?.accessibilityRole).toBe('article');
   ```
   **After:**
   ```ts
   expect((tree as any).props?.accessibilityRole).toBe('none');
   ```

   Full context (lines 113–116):
   ```ts
   it('includes an accessibilityRole of none on the outer container', () => {
       const tree = PassageCard({ passage: 'Hello' });
       expect((tree as any).props?.accessibilityRole).toBe('none');
   });
   ```

   > Also update the `it(...)` description from `'article'` to `'none'` for clarity.

5. **Verify TypeScript:**
   ```bash
   cd app/sentinel-mobile
   pnpm exec tsc --noEmit
   ```
   Must exit 0 with no errors.

6. **Run the passage-card test file:**
   ```bash
   pnpm vitest run features/exam/components/session/passage-card.test.tsx
   ```
   All tests must pass.

7. **Run the full mobile test suite:**
   ```bash
   pnpm vitest run
   ```
   No regressions.

8. **Commit both files together:**
   ```bash
   git add app/sentinel-mobile/features/exam/components/session/passage-card.tsx \
           app/sentinel-mobile/features/exam/components/session/passage-card.test.tsx
   git commit -m "fix(mobile): replace invalid accessibilityRole 'article' with 'none' in PassageCard

   'article' is an HTML/ARIA role not in React Native's AccessibilityRole union.
   Android's RCTView bridge validates roles strictly and throws at runtime,
   crashing the exam session on Android. iOS silently ignored the invalid value.

   Fix: replace with 'none' and remove the 'as any' TypeScript suppression cast.
   The accessibilityLabel already describes the passage region for screen readers.

   Closes: Android exam session crash – Invalid accessibility role value: article
   AC: AC-1, AC-2, AC-3, AC-4"
   ```

---

## Verification

### Evidence (Executed 2026-09-29)

| Check | Result |
|---|---|
| Scope fence (`git diff --name-only`) | `passage-card.tsx`, `passage-card.test.tsx` — **0 scope leaks** |
| `pnpm test` (full suite) | **58/58 test files passed, 401/401 tests passed** |
| `passage-card.test.tsx` (7 tests) | ✅ **PASS** — 7/7 tests, 5ms |
| TypeScript (`accessibilityRole` errors) | **0 errors** on changed files — `"none"` is a valid `AccessibilityRole` without `as any` |
| Commit SHA | `7b5e69bd` on `task/2026-09-29-0001/p01-u01-apply-fix` |

### Test Type: Unit Tests

**Justification:** The change is isolated to one function (a React component's render output) with no new collaborators. Unit tests on the component's render tree are the exact right tool — an integration or architecture test would add no additional signal here.

**Cases to verify:**

| Case | File:Line | Assertion | Expected |
|---|---|---|---|
| Outer container has valid `accessibilityRole` | `passage-card.test.tsx:113` | `.toBe('none')` | Pass |
| Passage renders when non-empty | `passage-card.test.tsx` (existing) | Text present | Pass (no regression) |
| Passage collapses when `isExpanded=false` | `passage-card.test.tsx` (existing) | Text absent | Pass (no regression) |
| Returns null when passage is empty/whitespace | `passage-card.test.tsx` (existing) | `null` | Pass (no regression) |
| HTML entities cleaned correctly | `passage-card.test.tsx` (existing) | Cleaned text | Pass (no regression) |

**Commands:**
```bash
# Targeted
pnpm vitest run features/exam/components/session/passage-card.test.tsx

# Full suite
pnpm vitest run
```

### TypeScript Compilation Check

```bash
pnpm exec tsc --noEmit
# Expected: exits 0, no output
```

**Justification:** Removing `as any` means TypeScript will now statically verify `"none"` is a valid `AccessibilityRole`. If the fix is incorrect, the compiler will catch it before any device test.

---

## Rollback

```bash
# Revert the commit on the unit branch
git revert HEAD

# Or, if not yet merged, just reset
git reset --hard HEAD~1
```

No data migrations, API contracts, or infrastructure changes to undo.

---

## Definition of Done

- [ ] Maps to acceptance criteria: AC-1, AC-2, AC-3, AC-4
- [ ] Executed inside dedicated worktree `.worktrees/0001/phase-01/unit-01-apply-fix/` without touching the primary working tree
- [ ] `passage-card.tsx` line 63: `accessibilityRole="none"` (no `as any`)
- [ ] `passage-card.test.tsx` line 115: `.toBe('none')`
- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm vitest run features/exam/components/session/passage-card.test.tsx` — all tests pass
- [ ] `pnpm vitest run` — full suite passes, no regressions
- [ ] Both files committed together in a single commit with the message above
- [ ] Changes committed cleanly to unit branch `task/0001/phase-01/unit-01-apply-fix`
- [ ] Zero scope leaks confirmed via `/review` (no other files modified)
- [ ] Unit branch merged into `task/0001/phase-01` after review

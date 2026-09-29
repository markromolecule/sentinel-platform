---
title: "Exam Session Android Crash – Invalid accessibilityRole 'article'"
type: context
status: ready
created: "2026-09-29"
tags: [context, fix, mobile, android, accessibility, exam-session]
feature: "exam-session-android-accessibility-role-crash"
---

# Exam Session Android Crash – Invalid `accessibilityRole` 'article' Context Specification

## 1. Overview & Objective

- **Problem Statement:**  
  When a student enters an exam session on **Android** (both a production `.apk` build and Expo Go on Android), the app immediately crashes with the following RCTView bridge error:

  ```
  Error while updating property 'accessibilityRole' of a view managed by: RCTView
  null
  Invalid accessibility role value: article
  ```

  The crash does **not** occur on iOS (Expo Go or native) because iOS silently ignores unknown `accessibilityRole` values, whereas Android's `RCTView` validates them strictly against its allowed role enum.

- **Root Cause (confirmed via codebase inspection):**  
  `passage-card.tsx` at **line 63** passes `accessibilityRole={"article" as any}` to a `<View>`.  
  `"article"` is a **web/ARIA role** — it is **not** in the React Native `AccessibilityRole` type union.  
  The `as any` cast was used to suppress the TypeScript compiler error, masking the underlying incompatibility that then crashes the Android bridge at runtime.

- **Business / User Value:**  
  Exam sessions are completely inaccessible on Android. Every student attempting an exam on an Android device will see the crash overlay and be unable to proceed. This is a P0 blocker for Android users.

- **Success Criteria:**
  - [ ] The exam session screen loads without error on Android (Expo Go and APK builds).
  - [ ] The `PassageCard` outer `<View>` uses a valid React Native `accessibilityRole`.
  - [ ] The `as any` cast is removed; TypeScript compilation passes with no suppressed errors.
  - [ ] The existing `passage-card.test.tsx` assertion that checks `accessibilityRole === 'article'` is updated to reflect the new valid role.
  - [ ] No regression on iOS — the passage card still renders and is accessible.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a student on Android, I want to enter my exam session without errors, so that I can complete my exam.*
- *As a screen reader user on Android, I want the reading passage to have a meaningful accessibility role, so that the passage content is semantically described to me.*

### Functional Requirements

- [ ] Replace `accessibilityRole={"article" as any}` with a valid React Native `AccessibilityRole` value on the `PassageCard` outer container.
- [ ] The chosen role must accurately convey the semantic purpose of the passage container (a readable region of content).
- [ ] Remove the `as any` TypeScript suppression cast.
- [ ] Update the companion test in `passage-card.test.tsx` (line 113–116) to assert the new valid role.
- [ ] No other component files should be modified as part of this fix.

### Chosen Role Rationale

React Native's valid `AccessibilityRole` values relevant to a reading passage container:

| Role | Description | Verdict |
|---|---|---|
| `"none"` | No semantic role — removes all role context | ✅ Recommended |
| `"text"` | Identifies a text element | ✅ Acceptable alternative |
| `"summary"` | Describes a screen or section summary | ❌ Misleading |
| `"header"` | Section heading | ❌ Incorrect semantic |

**Decision:** Use `accessibilityRole="none"` and rely entirely on the descriptive `accessibilityLabel` already present on the container (`Reading passage: ${displayTitle}`). This is the most honest choice for a passive grouping `<View>` that is not an interactive control.

### Edge Cases & Failure Modes

- **Exam with no passage:** `PassageCard` returns `null` when `cleanedPassage` is empty — no crash surface; unaffected by this fix.
- **iOS regression:** iOS currently silently ignores `"article"`; switching to `"none"` is a no-op regression risk on iOS.
- **Future React Native article role:** If RN ever adds `"article"`, the fix remains valid but can be revisited then.

---

## 3. Technical & Architectural Context

- **Affected Domain / Layer:** Mobile only — `app/sentinel-mobile`.
- **Crash trigger:** Any exam session that includes a question with a **reading passage** (`passage` prop is non-empty). `PassageCard` renders inside `QuestionCard` when a passage is present.

### Files to Modify

| File | Line | Change |
|---|---|---|
| `app/sentinel-mobile/features/exam/components/session/passage-card.tsx` | 63 | `{"article" as any}` → `"none"` |
| `app/sentinel-mobile/features/exam/components/session/passage-card.test.tsx` | 115 | `.toBe('article')` → `.toBe('none')` |

### Files Confirmed Unaffected

- All other `accessibilityRole` usages in the exam feature use valid React Native values (`"radio"`, `"checkbox"`, `"button"`, `"alert"`).
- `exam-session-screen.tsx`, `question-card.tsx`, and all other session components are unaffected.

### Root Cause Evidence

```tsx
// passage-card.tsx — line 62–64 (BEFORE)
<View
    accessibilityRole={"article" as any}   // ← INVALID on Android RCTView
    accessibilityLabel={`Reading passage: ${displayTitle}`}

// passage-card.tsx — line 62–64 (AFTER)
<View
    accessibilityRole="none"               // ← Valid React Native role
    accessibilityLabel={`Reading passage: ${displayTitle}`}
```

- **Security & Authorization:** N/A.
- **Data Model / Schema:** No changes.

---

## 4. UI/UX & Interaction Guidelines

- **No visual change** — `accessibilityRole` is not a visual property.
- **Screen reader behaviour:** With `"none"`, TalkBack (Android) and VoiceOver (iOS) will announce the `accessibilityLabel` text without a role prefix — appropriate for a passive reading region.

---

## 5. Scope & Boundaries

### In Scope

- Fix `accessibilityRole={"article" as any}` → `accessibilityRole="none"` in `passage-card.tsx`.
- Update the corresponding unit test assertion in `passage-card.test.tsx`.
- Verify TypeScript compiles without `as any` cast.

### Out of Scope / Non-Goals

- Refactoring the full `PassageCard` component.
- End-to-end Android build tests.
- Modifying any server-side or web code.
- Other `accessibilityRole` values in the codebase (all valid, confirmed by search).

---

## 6. References & External Context

- **React Native AccessibilityRole valid values:** `adjustable`, `alert`, `button`, `checkbox`, `combobox`, `grid`, `header`, `image`, `imagebutton`, `keyboardkey`, `link`, `list`, `listitem`, `menu`, `menubar`, `menuitem`, `none`, `progressbar`, `radio`, `radiogroup`, `scrollbar`, `search`, `slider`, `spinbutton`, `summary`, `switch`, `tab`, `tabbar`, `tablist`, `text`, `timer`, `togglebutton`, `toolbar`, `webview`.
  Source: https://reactnative.dev/docs/accessibility#accessibilityrole

- **Affected source:** `passage-card.tsx` line 63
- **Affected test:** `passage-card.test.tsx` line 115
- **Platform behaviour difference:** iOS ignores unknown `accessibilityRole`; Android (`RCTView`) throws a runtime bridge error for any value not in its enum.

# Institution Wizard Refactor — Goal

## Feature: Naming Conventions

### 1. Replace rooms & sections in `institution_wizard` with naming conventions

Remove the `rooms` and `sections` tabs from the `institution_wizard` and replace them
with a `naming_conventions` configuration step. Child institutions inherit the parent's
naming conventions as prefill defaults when creating or editing rooms and sections —
only the name or number field needs to change.

### 2. Section naming must be scoped to its parent course

Section naming conventions should be tied to their associated course. If the parent
institution defines a course as `BSIT-MWAF`, the section naming convention (e.g., `INF-231`)
must reflect that. The convention is inherited and used as the prefill baseline for all
child section records under that course.

### 3. Rooms require an order/number name and a mandatory type

Rooms are identified by an ordering name or room number. Every room must declare a
`type` to support downstream filtering and assignment. Supported types:

- `Laboratory Room`
- `Lecture Room`
- `Virtual Room`

### 4. Exclude `course` from naming conventions

Do not include a `course` field inside naming conventions. Courses are managed by the
`course` component, which owns the full course list under an institution. Child
institutions only add or remove courses from the inherited list — they do not re-enter
them. This eliminates redundant data entry across branches.

---

## Data: Migration

### 5. New migration — persist `naming_conventions` at the institution level

Create a database migration that stores `naming_conventions` per institution. Each
record should be linkable to its parent institution so child records can resolve and
prefill from it. The migration should support inheritance: a child institution falls
back to the parent's convention if none is explicitly set.

---

## Architecture: Dynamic Components

### 6. Refactor rooms and sections into reusable components

Refactor `rooms` and `sections` into standalone dynamic components that can be composed
inside the `course` component. When rendered in context, they receive the parent
institution's `naming_convention` as a prop and use it to prefill the create/edit form.
Only the name or number field requires manual input from the user.

---

## UI: Institution Wizard

### 7. Update background colors in `institution_wizard`

The wizard currently renders all step components on a plain white background. Update
to use surface-level design tokens to visually distinguish the wizard context from
general content areas.

```

Key improvements made:

- **Grouped by concern** (Feature / Data / Architecture / UI) so engineers can scope work independently
- **Removed repetition** — the prefill behavior was stated 3 times in the original; it's now stated once cleanly
- **Clarified the course exclusion rationale** — not just what to remove but why
- **Made the room type requirement explicit** — marked as mandatory, not optional
- **Migration spec includes inheritance fallback** — an important detail that was implied but unstated
- **Numbered for easy ticket referencing**
```

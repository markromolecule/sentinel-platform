---
alwaysApply: true
scene: git_message
---

# Role

Expert engineer writing production-grade Git commit messages from
the diff, implementation plan, and explicit context only.
Do not invent changes.

# Title Format

`<type>(<scope>): <summary>`

Types: feat, fix, refactor, chore, docs, test, perf, build, ci

- Scope: most specific changed area, kebab-case; dominant if multiple
- Summary: imperative mood, no period, ≤72 chars total

# Body

One paragraph: what changed, why, and how it supports the architecture.

# Required Sections

### Phase Progress

- Phase: <N> - <Title>
  (match from
    - @docs/task/[YYYY-MM-DD]/[type]-[id]-implementation-plan-[feature-name].md
    - @docs/task/[YYYY-MM-DD]/[type]-[id]-execution-plan-[feature-name].md;
      else "Unmapped - No matching phase")

### Tasks Done So Far

- Past-tense tasks from @docs marked [x]/Done/Completed, relevant to diff
- If none: "No directly relevant completed tasks found."

# Rules

- Lines ≤72 chars; markdown only; no code fences; no speculation

# Output Template

<type>(<scope>): <summary>

<Body paragraph>

### Phase Progress

- Phase: <N> - <Title>

### Tasks Done So Far

- <Task>

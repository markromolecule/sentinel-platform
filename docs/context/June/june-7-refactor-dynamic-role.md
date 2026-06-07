# Refactor: Static Role Logic → Dynamic Role-Based Access Control (RBAC)

## Overview

The goal is to refactor all hardcoded/static role logic in the codebase into a
fully dynamic Role-Based Access Control (RBAC) system. This will make the
application scalable, maintainable, and capable of supporting new roles without
requiring backend code changes.

---

## Problem Statement

The current implementation relies on **hardcoded role identifiers** (e.g.,
`if role === "admin"`, `if role === "superadmin"`) scattered throughout the backend
logic. This creates a tightly coupled system where:

- Adding a new role requires **manual updates to the backend codebase**
- Developers must trace every location where role checks occur to apply changes
- Risk of missed role checks increases as the codebase grows
- The existing dynamic RBAC infrastructure (Role, Role Matrix, Permissions)
  is **underutilized** because the logic bypasses it

---

## Current State (As-Is)

- Role checks are done via **static string comparisons** or **hardcoded
  conditionals** in business logic, middleware, or controllers
- Some parts of the system do reference the dynamic RBAC structure
  (Role → Role Matrix → Permissions), but coverage is **inconsistent**
- When a new role is introduced, developers must:
    1. Manually find all hardcoded role checks
    2. Update each one to account for the new role
    3. Re-test affected logic — high regression risk

### Example of the Anti-Pattern (Illustrative)

```js
// ❌ Static/hardcoded role check — what we want to eliminate
if (user.role === 'admin' || user.role === 'superadmin') {
    allowAccess();
}
```

---

## Desired State (To-Be)

All role-based logic should be **resolved dynamically** by querying the RBAC
system at runtime, using the three-layer model already in place:

| Layer         | Description                                                |
| ------------- | ---------------------------------------------------------- |
| `Role`        | Defines who the user is (e.g., Admin, Superadmin, Support) |
| `Role Matrix` | Maps roles to a set of permitted actions or resources      |
| `Permissions` | Granular flags that govern specific operations             |

### Example of the Target Pattern (Illustrative)

```js
// ✅ Dynamic role check — resolves via RBAC at runtime
if (await hasPermission(user.roleId, 'access:resource')) {
    allowAccess();
}
```

---

## Goals

1. **Eliminate all hardcoded role string comparisons** from business logic,
   middleware, guards, and controllers
2. **Centralize role resolution** through a single RBAC service/utility that
   queries Role → Role Matrix → Permissions
3. **Ensure adding a new role requires zero backend code changes** — only
   database/configuration updates
4. **Improve auditability** — role-permission mappings should be traceable
   and manageable (e.g., via an admin panel or config)

---

## Scope of Work

- [ ] Audit the codebase for all instances of hardcoded role checks
- [ ] Identify which modules/layers are affected
      (middleware, controllers, services, guards)
- [ ] Refactor each instance to use the dynamic RBAC resolver
- [ ] Ensure the Role Matrix and Permissions tables/models are the
      **single source of truth**
- [ ] Write/update unit and integration tests for permission resolution
- [ ] Document the RBAC structure for future developers

---

## Constraints & Considerations

- Must **not break existing role behavior** — the refactor is behavioral-neutral;
  permissions should map 1:1 with current access rules
- The RBAC model (Role, Role Matrix, Permissions) is already implemented —
  this task is about **adoption**, not redesign
- Consider **caching** permission lookups if performance is a concern
  (e.g., Redis cache per user session)
- Handle **edge cases**: unauthenticated users, roles with no permissions
  assigned, deprecated roles

---

## Success Criteria

- No hardcoded role strings remain in business logic
- A new role can be created and fully configured **without touching backend code**
- All role-permission checks route through the centralized RBAC resolver
- Existing access behavior is preserved post-refactor (validated by tests)

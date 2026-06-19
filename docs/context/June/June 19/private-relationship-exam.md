# Exam Visibility & Permission Model

## Overview

All exams exist within an **institution boundary** — even public exams are scoped to the institution and are not globally accessible. Visibility and permissions are always evaluated within this context.

---

## Roles

| Role                   | Description                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Owner**              | The user who created the exam. Has full control over all actions.                      |
| **Assigned User**      | A user explicitly granted access by the owner. Limited to read-only interactions.      |
| **Institution Member** | Any user within the same institution. Gains access only when an exam is set to Public. |

---

## Exam States

### Private

- Visible **only to the owner** by default.
- The owner may selectively grant access by assigning specific users.
- Unassigned institution members have **no visibility** into the exam.

### Assigned (Private + Shared)

- The exam remains private, but the owner has explicitly granted access to one or more users.
- Assigned users have **read-only** access:
    - ✅ View / access the builder page
    - ✅ Export to PDF
- Assigned users **cannot**:
    - ❌ Assign the exam to other users
    - ❌ Edit the exam
    - ❌ Delete the exam
    - ❌ Publish the exam

### 🌐 Public

- Visible to **all members within the institution** — no explicit assignment needed.
- Institution members have the **same restricted access** as assigned users:
    - ✅ View / access the builder page
    - ✅ Export to PDF
- They **cannot** modify, assign, delete, or publish.

> **Key distinction:** Public does not mean open to everyone — it is still bounded by the institution. The difference from Private is that no explicit assignment is required for institution members to access it.

---

## Permission Matrix — Exams

| Action                | Owner | Assigned User | Institution Member (Public) |
| --------------------- | :---: | :-----------: | :-------------------------: |
| View / Access Builder |  ✅   |      ✅       |             ✅              |
| Export to PDF         |  ✅   |      ✅       |             ✅              |
| Edit Exam             |  ✅   |      ❌       |             ❌              |
| Delete Exam           |  ✅   |      ❌       |             ❌              |
| Publish Exam          |  ✅   |      ❌       |             ❌              |
| Assign to Others      |  ✅   |      ❌       |             ❌              |

---

## Collections & Questions

The same visibility and permission logic applies to **collections** and the **questions** within them when an owner shares a collection with other users.

### Permission Matrix — Collections

| Action                  | Owner | Assigned User |
| ----------------------- | :---: | :-----------: |
| Use / Browse Collection |  ✅   |      ✅       |
| Edit Questions          |  ✅   |      ❌       |
| Delete Questions        |  ✅   |      ❌       |
| Archive Questions       |  ✅   |      ❌       |
| Rename Collection       |  ✅   |      ❌       |

> Assigned users can **use** the collection (e.g., reference or pull questions into an exam) but cannot modify its contents or metadata in any way.

---

## Key Principles

1. **Institution-scoped** — All access, whether public or private, is bounded by the institution. There is no cross-institution visibility.
2. **Owner-exclusive mutations** — Only the owner can edit, delete, publish, or delegate access to an exam or collection.
3. **Uniform read-only access** — Assigned users and institution members (for public exams) share the same restricted permission set: view builder + export to PDF.
4. **Assignment does not propagate** — Assigned users cannot re-assign access to other users. Delegation is strictly an owner action.
5. **Consistent model** — The same private / assigned / public logic that governs exams applies equally to collections and their questions.

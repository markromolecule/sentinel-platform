# Collection Sharing & Visibility

## Goal

Implement a sharing mechanism and public/private visibility model for the Collection page.

---

## Visibility Modes

### Private (default)

The collection is only accessible to its creator and explicitly shared users.

- The creator can invite specific users to access the collection.
- Shared/assigned users can view and use the collection but **cannot** edit, update, or delete it.

### Public

The collection is discoverable and accessible by all users.

- Any user can view and use the collection.
- Non-creators and non-assigned users are restricted from editing, updating, or deleting the collection.

---

## Permission Matrix

| Action | Creator | Shared / Assigned | Other Users (Public) |
| ------ | :-----: | :---------------: | :------------------: |
| View   |   ✅    |        ✅         |  ✅ _(public only)_  |
| Use    |   ✅    |        ✅         |  ✅ _(public only)_  |
| Edit   |   ✅    |        ✅         |          ❌          |
| Update |   ✅    |        ✅         |          ❌          |
| Delete |   ✅    |        ❌         |          ❌          |
| Share  |   ✅    |        ❌         |          ❌          |

---

## Key Rules

- A **private** collection can still be shared with specific users while remaining hidden from the public.
- Visibility (public/private) is controlled exclusively by the **creator**.
- Shared/assigned users have the same restricted access regardless of whether the collection is public or private.

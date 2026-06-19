# Issue

## Permission Matrix

| Action | Creator | Shared / Assigned | Other Users (Public) |
| ------ | :-----: | :---------------: | :------------------: |
| View   |   ✅    |        ✅         |  ✅ _(public only)_  |
| Use    |   ✅    |        ✅         |  ✅ _(public only)_  |
| Edit   |   ✅    |        ✅         |          ❌          |
| Update |   ✅    |        ✅         |          ❌          |
| Delete |   ✅    |        ❌         |          ❌          |
| Share  |   ✅    |        ❌         |          ❌          |

- But the issue right now is that the creator of the collection is the one that does not have access, meanwhile the other users (public) has the access to the collection. This is not the expected behavior.

- Double check the implementation on
    - sentinel-core
    - sentinel-web
    * To make sure that the expected behavior will be resolved. Ensure that every collection has a creator / owner that has those permissions.

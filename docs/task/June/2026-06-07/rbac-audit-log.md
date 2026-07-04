# RBAC Audit Log

| File | Line | Pattern | Current Role Check | Proposed Permission Key |
| ----------------------------------------- | ---- | ------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `room.routes.ts` | 24 | `roleAuthMiddleware` | `c.req.method === 'GET' ? ['support', 'superadmin', 'admin', 'instructor'] : ['support']` | `rooms:view` (GET) / `rooms:manage` (non-GET) |
| `room.routes.ts` | 30 | `roleAuthMiddleware` | `c.req.method === 'GET' ? ['support', 'superadmin', 'admin', 'instructor'] : ['support']` | `rooms:view` (GET) / `rooms:manage` (non-GET) |
| `room.routes.ts` | 34 | `roleAuthMiddleware` | `['support']` | `rooms:manage` |
| `semesters.routes.ts` | 34 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method, ['instructor'])` | `semesters:view` (GET) / `semesters:manage` (non-GET) |
| `semesters.routes.ts` | 38 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method, ['instructor'])` | `semesters:view` (GET) / `semesters:manage` (non-GET) |
| `semesters.routes.ts` | 42 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `semesters:manage` (bulk-delete is non-GET) |
| `departments.routes.ts` | 37 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method, ['instructor'])` | `departments:view` (GET) / `departments:manage` (non-GET) |
| `departments.routes.ts` | 41 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method, ['instructor'])` | `departments:view` (GET) / `departments:manage` (non-GET) |
| `departments.routes.ts` | 45 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `departments:manage` (bulk-delete is non-GET) |
| `institution.routes.ts` | 53 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `institutions:view` (GET) / `institutions:manage` (non-GET) |
| `institution.routes.ts` | 57 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `institutions:view` (GET) / `institutions:manage` (non-GET) |
| `institution.routes.ts` | 61 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `institutions:manage` |
| `institution.routes.ts` | 65 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `institutions:view` (GET) / `institutions:manage` (non-GET) |
| `institution.routes.ts` | 69 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `institutions:view` (GET) / `institutions:manage` (non-GET) |
| `institution.routes.ts` | 73 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `institutions:view` (GET) / `institutions:manage` (non-GET) |
| `institution.routes.ts` | 77 | `roleAuthMiddleware` | `getCoreAdminAllowedRoles(c.req.method)` | `institutions:view` (GET) / `institutions:manage` (non-GET) |
| `access-control-authorization.service.ts` | 16 | inline check | `role === 'support'` | `permissions:manage` |
| `access-control-authorization.service.ts` | 23 | inline check | `(role === 'superadmin'                                                                   |                                                             | role === 'admin') && hasActivePermission(c, requiredPermission)` | `permissions:view` (GET) / `permissions:manage` (non-GET) |
| `access-control-authorization.service.ts` | 39 | inline check | `role !== 'support' && role !== 'superadmin' && role !== 'admin'` | `permissions:manage` |
| `access-control-assignment.service.ts` | 66 | `CORE_ROLES` | `['superadmin', 'admin', 'instructor', 'support']` | `role.is_system` |
| `assessment-access.ts` | 24 | `ASSESSMENT_ALLOWED_ROLES` | `['admin', 'superadmin', 'instructor', 'support']` | `assessments:manage` |
| `assessment-access.ts` | 32 | `ASSESSMENT_READ_ALLOWED_ROLES` | `['admin', 'superadmin', 'instructor', 'support', 'student']` | `assessments:view` |
| `assessment-access.ts` | 51 | inline check | `role === 'superadmin'                                                                    |                                                             | role === 'support'` | `institutions:cross-tenant-view` |
| `activity-notification-base.service.ts` | 7 | `SupportedActorRole` | type definition | replaced with `string` |
| `activity-notification-base.service.ts` | 57 | `priority` | `['support', 'superadmin', 'admin', 'instructor', 'student']` | DB order check |
| `activity-notification-base.service.ts` | 134 | inline check | `actorRole === 'support'                                                                  |                                                             | actorRole === 'superadmin'` | `institutions:cross-tenant-view` |
| `activity-notification-base.service.ts` | 74 | static role routing map | hardcoded dictionary | `notification_role_routing` DB config key |

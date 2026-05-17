'use client';

import { SupportPortalBridge } from '../shared/support-portal-bridge';

/**
 * Shared page for managing academic departments. Delegates to SupportPortalBridge
 * to show either read-only view options or full portal management links based on capabilities.
 */
export function DepartmentsPage() {
    return (
        <SupportPortalBridge
            title="Departments Setup"
            description="Manage academic departments, faculties, and fields of study."
            resourceKey="departments"
        />
    );
}

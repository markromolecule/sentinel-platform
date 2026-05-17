'use client';

import { SupportPortalBridge } from '../shared/support-portal-bridge';

/**
 * Shared page for managing institutions. Delegates to SupportPortalBridge
 * to show either read-only view options or full portal management links based on capabilities.
 */
export function InstitutionsPage() {
    return (
        <SupportPortalBridge
            title="Institutions Setup"
            description="Configure institutions, campuses, and academic entities."
            resourceKey="institutions"
        />
    );
}

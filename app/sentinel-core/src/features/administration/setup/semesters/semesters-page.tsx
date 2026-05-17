'use client';

import { SupportPortalBridge } from '../shared/support-portal-bridge';

/**
 * Shared page for managing semesters and academic terms. Delegates to SupportPortalBridge
 * to show either read-only view options or full portal management links based on capabilities.
 */
export function SemestersPage() {
    return (
        <SupportPortalBridge
            title="Semesters Setup"
            description="Manage academic semesters, terms, and academic year settings."
            resourceKey="semesters"
        />
    );
}

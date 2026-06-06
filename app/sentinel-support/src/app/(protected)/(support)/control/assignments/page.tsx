'use client';

import { Suspense } from 'react';
import { AccessControlGovernanceForm } from '../_components/governance/control-governance-form';

export default function AccessControlAssignmentsPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading governance...</div>}>
            <AccessControlGovernanceForm />
        </Suspense>
    );
}

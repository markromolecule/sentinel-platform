'use client';

import { Suspense } from 'react';
import { TelemetryGovernanceForm } from '../_components/governance/telemetry-governance-form';

export default function TelemetryHealthPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading telemetry...</div>}>
            <TelemetryGovernanceForm />
        </Suspense>
    );
}

import type { ReactNode } from 'react';
import { TelemetryDraftProvider } from './_contexts/telemetry-draft-context';

export default function TelemetryLayout({ children }: { children: ReactNode }) {
    return <TelemetryDraftProvider>{children}</TelemetryDraftProvider>;
}

import type { TelemetrySettings } from '@sentinel/shared';

export type RuntimePhase = 'idle' | 'loading' | 'running' | 'error' | 'unsupported';

export type UseMediaPipeSandboxArgs = {
    settings: TelemetrySettings['mediaPipeSandbox'];
};

import { Alert, AlertDescription, AlertTitle } from '@sentinel/ui';
import { MEDIAPIPE_SUPPORTED_EVENT_TYPES } from '@sentinel/shared';
import { Beaker } from 'lucide-react';
import { StatusStrip } from '../shared/status-strip';
import type { SandboxHeaderProps } from './_types';

export function SandboxHeader({ sandbox, phase }: SandboxHeaderProps) {
    const runtimeLabel =
        phase === 'running'
            ? 'Live calibration'
            : phase === 'loading'
              ? 'Initializing'
              : phase === 'unsupported'
                ? 'Unsupported browser'
                : 'Standby';

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-lg font-bold tracking-tight">MediaPipe Sandbox</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Tune the camera runtime, verify gaze and face signals, and preview the telemetry
                    payloads that downstream student flows will reuse.
                </p>
            </div>

            <Alert className="border-primary/20 bg-primary/5 py-4">
                <Beaker className="text-primary size-5" />
                <AlertTitle className="text-primary ml-2 text-sm font-semibold">
                    Support-Owned Calibration Workspace
                </AlertTitle>
                <AlertDescription className="text-muted-foreground ml-2 text-xs leading-relaxed">
                    This sandbox now acts as the MediaPipe building ground and rollout control
                    plane. Support can tune thresholds here before checkup and attempt reuse the
                    same contract.
                </AlertDescription>
            </Alert>

            <StatusStrip
                items={[
                    {
                        label: 'Supported Signals',
                        value: MEDIAPIPE_SUPPORTED_EVENT_TYPES.join(', '),
                        hint: 'Telemetry-aligned events',
                    },
                    {
                        label: 'Runtime State',
                        value: runtimeLabel,
                        hint:
                            phase === 'running'
                                ? 'Camera and inference active'
                                : 'Waiting for launch',
                    },
                    {
                        label: 'Rollout',
                        value: sandbox.emitDuringExam
                            ? 'Attempt enabled'
                            : sandbox.captureDuringCheckup
                              ? 'Checkup enabled'
                              : 'Sandbox only',
                        hint: 'Governed by saved settings',
                    },
                ]}
            />
        </div>
    );
}

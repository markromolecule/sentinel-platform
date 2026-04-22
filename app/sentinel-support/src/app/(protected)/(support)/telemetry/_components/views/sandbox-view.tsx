import { Alert, AlertDescription, AlertTitle, Input } from '@sentinel/ui';
import {
    TELEMETRY_MEDIAPIPE_SANDBOX_V1_EVENT_TYPES,
    TELEMETRY_MEDIAPIPE_SANDBOX_V1_INERT_FIELDS,
    TELEMETRY_MEDIAPIPE_SANDBOX_V1_PREREQUISITES,
} from '@sentinel/shared';
import { Beaker } from 'lucide-react';
import type { ViewProps } from '../shared/telemetry-types';
import { ToggleRow } from '../shared/toggle-row';
import { LabeledField } from '../shared/labeled-field';
import { StatusStrip } from '../shared/status-strip';

export function SandboxView({ currentDraft, updateSettings, isPending }: ViewProps) {
    return (
        <section id="sandbox" className="scroll-mt-24 space-y-8 py-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold tracking-tight">MediaPipe Sandbox</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Experimental gaze-tracking and facial analysis configurations.
                    </p>
                </div>

                <Alert className="border-amber-500/20 bg-amber-500/5 py-4">
                    <Beaker className="size-5 text-amber-500" />
                    <AlertTitle className="text-sm font-semibold ml-2 text-amber-600">Experimental Rollout</AlertTitle>
                    <AlertDescription className="text-xs ml-2 leading-relaxed opacity-90 text-amber-700/80">
                        MediaPipe remains a sandbox in v1. Settings are persisted for future
                        integrations but are not an active enforcement layer today.
                    </AlertDescription>
                </Alert>

                <StatusStrip
                    items={[
                        {
                            label: 'Allowed Signal',
                            value: TELEMETRY_MEDIAPIPE_SANDBOX_V1_EVENT_TYPES.join(', '),
                            hint: 'v1 reserved signals',
                        },
                        {
                            label: 'Runtime Scope',
                            value: 'Staging Only',
                            hint: 'No live proctoring yet',
                        },
                        {
                            label: 'Staged Toggles',
                            value: `${TELEMETRY_MEDIAPIPE_SANDBOX_V1_INERT_FIELDS.length} active`,
                            hint: 'Available markers',
                        },
                    ]}
                />
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">Sandbox Flags</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        Stage gaze-tracking behavior without coupling it to the active exam runtime.
                    </p>
                </div>
                <div className="divide-y rounded-xl border bg-card/50 px-4">
                    <ToggleRow
                        label="Enable MediaPipe sandbox"
                        description="Keep sandbox configuration available for future rollout work."
                        checked={currentDraft.mediaPipeSandbox.enabled}
                        onCheckedChange={(checked) =>
                            updateSettings((settings) => ({
                                ...settings,
                                mediaPipeSandbox: { ...settings.mediaPipeSandbox, enabled: checked },
                            }))
                        }
                        disabled={isPending}
                    />
                    <ToggleRow
                        label="Capture during checkup"
                        description="Stage checkup-time capture without making it mandatory."
                        checked={currentDraft.mediaPipeSandbox.captureDuringCheckup}
                        onCheckedChange={(checked) =>
                            updateSettings((settings) => ({
                                ...settings,
                                mediaPipeSandbox: {
                                    ...settings.mediaPipeSandbox,
                                    captureDuringCheckup: checked,
                                },
                            }))
                        }
                        disabled={isPending}
                    />
                    <ToggleRow
                        label="Emit during exam"
                        description="Stage exam-time MediaPipe emission while the feature remains experimental."
                        checked={currentDraft.mediaPipeSandbox.emitDuringExam}
                        onCheckedChange={(checked) =>
                            updateSettings((settings) => ({
                                ...settings,
                                mediaPipeSandbox: {
                                    ...settings.mediaPipeSandbox,
                                    emitDuringExam: checked,
                                },
                            }))
                        }
                        disabled={isPending}
                    />
                    <ToggleRow
                        label="Calibration required"
                        description="Require calibration as part of the eventual sandbox activation workflow."
                        checked={currentDraft.mediaPipeSandbox.calibrationRequired}
                        onCheckedChange={(checked) =>
                            updateSettings((settings) => ({
                                ...settings,
                                mediaPipeSandbox: {
                                    ...settings.mediaPipeSandbox,
                                    calibrationRequired: checked,
                                },
                            }))
                        }
                        disabled={isPending}
                    />
                    <ToggleRow
                        label="Debug overlay"
                        description="Expose extra on-screen diagnostics during experimental testing."
                        checked={currentDraft.mediaPipeSandbox.debugOverlayEnabled}
                        onCheckedChange={(checked) =>
                            updateSettings((settings) => ({
                                ...settings,
                                mediaPipeSandbox: {
                                    ...settings.mediaPipeSandbox,
                                    debugOverlayEnabled: checked,
                                },
                            }))
                        }
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">Analysis Thresholds</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        Model confidence, frame sampling, and off-screen gaze parameters.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                    <LabeledField
                        label="Confidence threshold"
                        description="Minimum model confidence."
                    >
                        <Input
                            type="number"
                            min={0}
                            max={1}
                            step="0.01"
                            value={currentDraft.mediaPipeSandbox.confidenceThreshold}
                            onChange={(event) => {
                                const parsed = Number(event.currentTarget.value);
                                if (!Number.isFinite(parsed)) return;
                                updateSettings((settings) => ({
                                    ...settings,
                                    mediaPipeSandbox: {
                                        ...settings.mediaPipeSandbox,
                                        confidenceThreshold: parsed,
                                    },
                                }));
                            }}
                            disabled={isPending}
                            className="h-10"
                        />
                    </LabeledField>

                    <LabeledField
                        label="Frame interval (ms)"
                        description="Spacing between frame samples."
                    >
                        <Input
                            type="number"
                            min={100}
                            max={5000}
                            step="50"
                            value={currentDraft.mediaPipeSandbox.frameIntervalMs}
                            onChange={(event) => {
                                const parsed = Number(event.currentTarget.value);
                                if (!Number.isFinite(parsed)) return;
                                updateSettings((settings) => ({
                                    ...settings,
                                    mediaPipeSandbox: {
                                        ...settings.mediaPipeSandbox,
                                        frameIntervalMs: parsed,
                                    },
                                }));
                            }}
                            disabled={isPending}
                            className="h-10"
                        />
                    </LabeledField>

                    <LabeledField
                        label="Off-screen duration (ms)"
                        description="Mandatory gaze window."
                    >
                        <Input
                            type="number"
                            min={500}
                            max={60000}
                            step="100"
                            value={currentDraft.mediaPipeSandbox.offScreenDurationMs}
                            onChange={(event) => {
                                const parsed = Number(event.currentTarget.value);
                                if (!Number.isFinite(parsed)) return;
                                updateSettings((settings) => ({
                                    ...settings,
                                    mediaPipeSandbox: {
                                        ...settings.mediaPipeSandbox,
                                        offScreenDurationMs: parsed,
                                    },
                                }));
                            }}
                            disabled={isPending}
                            className="h-10"
                        />
                    </LabeledField>
                </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
                <h3 className="text-base font-semibold tracking-tight">Prerequisites before activation</h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                    {TELEMETRY_MEDIAPIPE_SANDBOX_V1_PREREQUISITES.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/40" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

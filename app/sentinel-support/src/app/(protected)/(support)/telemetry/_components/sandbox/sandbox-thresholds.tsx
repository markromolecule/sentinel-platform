import { Input } from '@sentinel/ui';
import { LabeledField } from '../shared/labeled-field';
import type { SandboxComponentProps } from './_types';

export function SandboxThresholds({
    sandbox,
    updateSettingsAction,
    isPending,
}: SandboxComponentProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-base font-semibold tracking-tight">Analysis Thresholds</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                    Confidence, cadence, and gaze duration settings update the live sandbox and the
                    preview payload catalog together.
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
                <LabeledField
                    label="Confidence threshold"
                    description="Minimum acceptable confidence before a face-based signal becomes actionable."
                >
                    <Input
                        type="number"
                        min={0}
                        max={1}
                        step="0.01"
                        value={sandbox.confidenceThreshold}
                        onChange={(event) => {
                            const parsed = Number(event.currentTarget.value);
                            if (!Number.isFinite(parsed)) return;
                            updateSettingsAction((settings) => ({
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
                    description="Spacing between MediaPipe frame samples inside the browser runtime."
                >
                    <Input
                        type="number"
                        min={100}
                        max={5000}
                        step="50"
                        value={sandbox.frameIntervalMs}
                        onChange={(event) => {
                            const parsed = Number(event.currentTarget.value);
                            if (!Number.isFinite(parsed)) return;
                            updateSettingsAction((settings) => ({
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
                    description="How long off-screen gaze must persist before the runtime preview shapes a gaze event."
                >
                    <Input
                        type="number"
                        min={500}
                        max={60000}
                        step="100"
                        value={sandbox.offScreenDurationMs}
                        onChange={(event) => {
                            const parsed = Number(event.currentTarget.value);
                            if (!Number.isFinite(parsed)) return;
                            updateSettingsAction((settings) => ({
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
    );
}

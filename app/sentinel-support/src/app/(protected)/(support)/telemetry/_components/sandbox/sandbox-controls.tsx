import { ToggleRow } from '../shared/toggle-row';
import type { SandboxComponentProps } from './_types';

export function SandboxControls({
    sandbox,
    updateSettingsAction,
    isPending,
}: SandboxComponentProps) {
    function handleDebugOverlayChange(checked: boolean) {
        updateSettingsAction((settings) => ({
            ...settings,
            mediaPipeSandbox: {
                ...settings.mediaPipeSandbox,
                debugOverlayEnabled: checked,
            },
        }));
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-base font-semibold tracking-tight">Sandbox Controls</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                    These saved settings govern support calibration now, then downstream checkup and
                    attempt rollout later.
                </p>
            </div>
            <div className="bg-card/50 divide-y rounded-xl border px-4">
                <ToggleRow
                    label="Enable MediaPipe sandbox"
                    description="Turns the support calibration workspace and downstream MediaPipe rollout contract on or off."
                    checked={sandbox.enabled}
                    onCheckedChange={(checked) =>
                        updateSettingsAction((settings) => ({
                            ...settings,
                            mediaPipeSandbox: {
                                ...settings.mediaPipeSandbox,
                                enabled: checked,
                            },
                        }))
                    }
                    disabled={isPending}
                />
                <ToggleRow
                    label="Capture during checkup"
                    description="Allows the later student checkup flow to reuse this calibrated MediaPipe runtime."
                    checked={sandbox.captureDuringCheckup}
                    onCheckedChange={(checked) =>
                        updateSettingsAction((settings) => ({
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
                    description="Allows the later student attempt runtime to emit MediaPipe-generated telemetry through the existing pipeline."
                    checked={sandbox.emitDuringExam}
                    onCheckedChange={(checked) =>
                        updateSettingsAction((settings) => ({
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
                    description="Makes stable single-face calibration a readiness requirement for later student rollout phases."
                    checked={sandbox.calibrationRequired}
                    onCheckedChange={(checked) =>
                        updateSettingsAction((settings) => ({
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
                    label="Show face key points on live preview"
                    description="Persists the landmark-dot and face-bounds overlay used in the live sandbox dialog and future debug-capable previews."
                    checked={sandbox.debugOverlayEnabled}
                    onCheckedChange={handleDebugOverlayChange}
                    disabled={isPending}
                />
            </div>
        </div>
    );
}

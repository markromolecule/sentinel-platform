import {
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Switch,
} from '@sentinel/ui';
import { CalibrationWorkspace } from './calibration-workspace';
import { TelemetryPreview } from './telemetry-preview';
import { IngestionDryRun } from './ingestion-dry-run';
import type { SandboxWorkspaceDialogProps } from './_types';

export function SandboxWorkspaceDialog({
    isOpen,
    onOpenChange,
    sandbox,
    updateSettingsAction,
    isPending,
    state,
    previewCatalog,
    currentPreviewPayload,
}: SandboxWorkspaceDialogProps) {
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
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[92vh] w-[min(96vw,1500px)] max-w-[min(96vw,1500px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1500px)]">
                <div className="bg-muted/30 flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                    <DialogHeader className="text-left">
                        <DialogTitle>MediaPipe Sandbox Workspace</DialogTitle>
                        <DialogDescription>
                            Live calibration workspace and telemetry preview now run together in
                            this dialog when support launches the sandbox.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-background/80 flex items-center gap-3 rounded-xl border px-3 py-2">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold">Show face key points</p>
                            <p className="text-muted-foreground text-xs">
                                Toggle landmark dots and face bounds on the live preview.
                            </p>
                        </div>
                        <Switch
                            checked={sandbox.debugOverlayEnabled}
                            onCheckedChange={handleDebugOverlayChange}
                            disabled={isPending}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
                        <CalibrationWorkspace
                            sandbox={sandbox}
                            state={state}
                            isPending={isPending}
                            updateSettingsAction={updateSettingsAction}
                        />

                        <Card className="border-primary/10">
                            <CardContent className="space-y-4 p-5">
                                <TelemetryPreview
                                    previewCatalog={previewCatalog}
                                    currentPreviewPayload={currentPreviewPayload}
                                />
                                <IngestionDryRun
                                    currentPreviewPayload={currentPreviewPayload}
                                    isPending={isPending}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="bg-muted/20 mt-6 rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Environment guidance
                        </p>
                        <p className="mt-2 text-sm leading-relaxed">
                            Low light and reflective eyeglasses can reduce iris stability and push
                            the sandbox into low-confidence or off-screen states. Use even front
                            lighting, avoid strong screen glare on lenses, and calibrate while
                            watching both the confidence card and the face-keypoint overlay.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

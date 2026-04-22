import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@sentinel/ui';
import { Camera } from 'lucide-react';
import type { SandboxLauncherProps } from './_types';

export function SandboxLauncher({
    sandbox,
    state,
    currentPreviewPayload,
    isPending,
    onLaunch,
}: SandboxLauncherProps) {
    const { phase, analysis, isCalibrated, lastUpdatedAt } = state;

    const runtimeLabel =
        phase === 'running'
            ? 'Live calibration'
            : phase === 'loading'
              ? 'Initializing'
              : phase === 'unsupported'
                ? 'Unsupported browser'
                : 'Standby';

    return (
        <Card className="border-primary/10">
            <CardHeader className="bg-muted/30 space-y-3 border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base">Sandbox Launcher</CardTitle>
                        <CardDescription>
                            Open the live calibration workspace and telemetry preview in a dialog so
                            support can tune signals without stretching the settings page.
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={phase === 'running' ? 'default' : 'secondary'}>
                            {runtimeLabel}
                        </Badge>
                        <Badge variant={isCalibrated ? 'default' : 'outline'}>
                            {isCalibrated ? 'Calibrated' : 'Pending calibration'}
                        </Badge>
                        <Badge variant="outline">
                            {sandbox.debugOverlayEnabled
                                ? 'Face key points visible'
                                : 'Face key points hidden'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="bg-muted/20 rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Latest signal
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                            {analysis?.signal ?? currentPreviewPayload.eventType}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Gaze {analysis?.gazeDirection ?? 'not available'}
                        </p>
                    </div>
                    <div className="bg-muted/20 rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Eye state
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                            {analysis?.eyeState ?? 'unknown'}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Close-eye checks now stay visible in preview
                        </p>
                    </div>
                    <div className="bg-muted/20 rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Confidence
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                            {analysis?.confidenceScore !== null &&
                            analysis?.confidenceScore !== undefined
                                ? analysis.confidenceScore.toFixed(2)
                                : 'n/a'}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Threshold {sandbox.confidenceThreshold.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-muted/20 rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Last update
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                            {lastUpdatedAt
                                ? new Date(lastUpdatedAt).toLocaleTimeString()
                                : 'waiting'}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Preview event {currentPreviewPayload.eventType}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        onClick={onLaunch}
                        disabled={isPending || phase === 'loading'}
                        className="gap-2"
                    >
                        <Camera className="size-4" />
                        {phase === 'running' ? 'Reopen sandbox' : 'Launch sandbox'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

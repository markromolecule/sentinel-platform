import {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Progress,
} from '@sentinel/ui';
import { Camera, CircleOff, Radar, ScanFace } from 'lucide-react';
import type { SandboxComponentProps, SandboxStateProps } from './_types';

export type CalibrationWorkspaceProps = SandboxComponentProps & {
    state: SandboxStateProps;
};

export function CalibrationWorkspace({ sandbox, state, isPending }: CalibrationWorkspaceProps) {
    const {
        videoRef,
        canvasRef,
        phase,
        analysis,
        errorMessage,
        isCameraActive,
        isSlowInitialization,
        lastUpdatedAt,
        calibrationProgress,
        isCalibrated,
        startSandbox,
        stopSandbox,
    } = state;

    const runtimeLabel =
        phase === 'running'
            ? 'Live calibration'
            : phase === 'loading'
              ? 'Initializing'
              : phase === 'unsupported'
                ? 'Unsupported browser'
                : 'Standby';

    return (
        <Card className="border-primary/10 overflow-hidden">
            <CardHeader className="bg-muted/30 space-y-3 border-b">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-base">Live Calibration Workspace</CardTitle>
                        <CardDescription>
                            Launch the camera feed, inspect landmark behavior, and confirm the
                            emitted signal posture before student rollout.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={phase === 'running' ? 'default' : 'secondary'}>
                            {runtimeLabel}
                        </Badge>
                        <Badge variant={isCalibrated ? 'default' : 'outline'}>
                            {isCalibrated ? 'Calibrated' : 'Pending calibration'}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        onClick={startSandbox}
                        disabled={isPending || phase === 'loading'}
                        className="gap-2"
                    >
                        <Camera className="size-4" />
                        {phase === 'running' ? 'Restart sandbox' : 'Launch sandbox'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={stopSandbox}
                        disabled={isPending || phase === 'idle'}
                        className="gap-2"
                    >
                        <CircleOff className="size-4" />
                        Stop sandbox
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border bg-slate-950">
                        <video
                            ref={videoRef}
                            className="aspect-video h-full min-h-[280px] w-full object-cover"
                            autoPlay
                            muted
                            playsInline
                        />
                        <canvas
                            ref={canvasRef}
                            className="pointer-events-none absolute inset-0 h-full w-full"
                        />
                        {!isCameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/85 p-6 text-center text-slate-100">
                                <ScanFace className="size-8 text-slate-300" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">
                                        Launch the support sandbox to begin MediaPipe analysis
                                    </p>
                                    <p className="text-xs text-slate-300">
                                        The camera feed stays local to this browser session. No raw
                                        video or landmarks are stored.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {(errorMessage || isSlowInitialization) && (
                        <Alert className="border-amber-500/20 bg-amber-500/5">
                            <Radar className="size-4 text-amber-500" />
                            <AlertTitle className="ml-2 text-sm text-amber-700">
                                Runtime attention needed
                            </AlertTitle>
                            <AlertDescription className="ml-2 text-xs leading-relaxed text-amber-700/80">
                                {errorMessage ??
                                    'Model initialization is taking longer than expected. Keep the tab active while MediaPipe warms up.'}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-muted/20 rounded-2xl border p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                                    Calibration
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {sandbox.calibrationRequired
                                        ? 'Required before rollout'
                                        : 'Optional guidance only'}
                                </p>
                            </div>
                            <Badge variant={isCalibrated ? 'default' : 'secondary'}>
                                {calibrationProgress}%
                            </Badge>
                        </div>
                        <Progress value={calibrationProgress} className="mt-4 h-2" />
                        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                            Stable single-face frames move the calibration meter forward. The
                            current threshold requires six consecutive ready frames.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-2xl border p-4">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                                Face status
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                                {analysis?.status ?? 'idle'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {analysis?.faceCount ?? 0} face(s) in frame
                            </p>
                        </div>
                        <div className="rounded-2xl border p-4">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                                Gaze direction
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                                {analysis?.gazeDirection ?? 'not available'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Signal {analysis?.signal ?? 'none'}
                            </p>
                        </div>
                        <div className="rounded-2xl border p-4">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                                Eye state
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                                {analysis?.eyeState ?? 'unknown'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Helps verify closed-eye behavior in the live preview
                            </p>
                        </div>
                        <div className="rounded-2xl border p-4">
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
                        <div className="rounded-2xl border p-4">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                                Last update
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                                {lastUpdatedAt
                                    ? new Date(lastUpdatedAt).toLocaleTimeString()
                                    : 'waiting'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Frame cadence {sandbox.frameIntervalMs}ms
                            </p>
                        </div>
                    </div>

                    {analysis?.reasons?.length ? (
                        <div className="bg-muted/20 rounded-2xl border p-4">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                                Runtime interpretation
                            </p>
                            <p className="mt-2 text-sm leading-relaxed">
                                {analysis.reasons[0]}
                            </p>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

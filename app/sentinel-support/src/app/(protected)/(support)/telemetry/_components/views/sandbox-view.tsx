'use client';

import { useMemo, useState } from 'react';
import {
    MEDIAPIPE_SUPPORTED_EVENT_TYPES,
    createMediaPipePreviewPayload,
    type MediaPipeSupportedEventType,
} from '@sentinel/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@sentinel/ui';
import { MonitorPlay, Settings, SlidersHorizontal } from 'lucide-react';
import type { ViewProps } from '../shared/telemetry-types';
import { useMediaPipeSandbox } from '../../_hooks/use-mediapipe-sandbox';
import { SandboxHeader } from '../sandbox/sandbox-header';
import { SandboxLauncher } from '../sandbox/sandbox-launcher';
import { SandboxWorkspaceDialog } from '../sandbox/sandbox-workspace-dialog';
import { SandboxControls } from '../sandbox/sandbox-controls';
import { SandboxThresholds } from '../sandbox/sandbox-thresholds';
import { SandboxRolloutNotes } from '../sandbox/sandbox-rollout-notes';

/**
 * Renders the MediaPipe Sandbox management interface, complete with calibration
 * status, diagnostic signals workspace, controls configuration, and specific anomaly thresholds.
 */
export function SandboxView({ currentDraft, updateSettingsAction, isPending }: ViewProps) {
    const sandbox = currentDraft.mediaPipeSandbox;
    const [isSandboxDialogOpen, setIsSandboxDialogOpen] = useState(false);

    const state = useMediaPipeSandbox({
        settings: sandbox,
    });

    const { thresholds, sessionContext, analysis, latestPayload, startSandbox, stopSandbox } =
        state;

    const previewCatalog = useMemo(() => {
        return MEDIAPIPE_SUPPORTED_EVENT_TYPES.map((eventType) => {
            const threshold = thresholds[eventType];

            return createMediaPipePreviewPayload({
                eventType,
                metadata: {
                    durationMs: threshold.durationThresholdMs ?? undefined,
                    confidenceScore: threshold.confidenceThreshold,
                    aggregation: {
                        trigger:
                            threshold.durationThresholdMs === null
                                ? 'immediate'
                                : 'duration-threshold',
                        threshold: threshold.durationThresholdMs ?? undefined,
                    },
                },
                sessionContext,
            });
        });
    }, [sessionContext, thresholds]);

    const currentPreviewPayload = useMemo(() => {
        return (
            latestPayload ??
            createMediaPipePreviewPayload({
                eventType:
                    (analysis?.signal as MediaPipeSupportedEventType | null) ?? 'GAZE_OFF_SCREEN',
                sessionContext,
            })
        );
    }, [analysis?.signal, latestPayload, sessionContext]);

    function handleSandboxDialogOpenChange(open: boolean) {
        setIsSandboxDialogOpen(open);

        if (!open) {
            stopSandbox();
        }
    }

    function handleLaunchSandbox() {
        setIsSandboxDialogOpen(true);
        void startSandbox();
    }

    return (
        <section id="sandbox" className="scroll-mt-24 space-y-8 py-4">
            <SandboxHeader sandbox={sandbox} phase={state.phase} />

            <Tabs defaultValue="workspace" className="w-full space-y-6">
                <TabsList className="bg-muted/50 border-muted-foreground/10 grid w-full max-w-md grid-cols-3 border p-1">
                    <TabsTrigger value="workspace" className="gap-2">
                        <MonitorPlay className="size-4" />
                        <span>Workspace</span>
                    </TabsTrigger>
                    <TabsTrigger value="controls" className="gap-2">
                        <Settings className="size-4" />
                        <span>Controls</span>
                    </TabsTrigger>
                    <TabsTrigger value="thresholds" className="gap-2">
                        <SlidersHorizontal className="size-4" />
                        <span>Thresholds</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="workspace" className="space-y-6 outline-none focus:outline-none">
                    <SandboxLauncher
                        sandbox={sandbox}
                        state={state}
                        currentPreviewPayload={currentPreviewPayload}
                        isPending={isPending}
                        updateSettingsAction={updateSettingsAction}
                        onLaunch={handleLaunchSandbox}
                    />

                    <SandboxWorkspaceDialog
                        isOpen={isSandboxDialogOpen}
                        onOpenChange={handleSandboxDialogOpenChange}
                        sandbox={sandbox}
                        updateSettingsAction={updateSettingsAction}
                        isPending={isPending}
                        state={state}
                        previewCatalog={previewCatalog}
                        currentPreviewPayload={currentPreviewPayload}
                    />

                    <SandboxRolloutNotes />
                </TabsContent>

                <TabsContent value="controls" className="space-y-6 outline-none focus:outline-none">
                    <SandboxControls
                        sandbox={sandbox}
                        updateSettingsAction={updateSettingsAction}
                        isPending={isPending}
                    />
                </TabsContent>

                <TabsContent value="thresholds" className="space-y-6 outline-none focus:outline-none">
                    <SandboxThresholds
                        sandbox={sandbox}
                        updateSettingsAction={updateSettingsAction}
                        isPending={isPending}
                    />
                </TabsContent>
            </Tabs>
        </section>
    );
}


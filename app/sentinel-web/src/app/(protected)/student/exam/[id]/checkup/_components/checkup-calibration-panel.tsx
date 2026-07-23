'use client';

import { CheckCircle2 } from 'lucide-react';
import { Progress } from '@sentinel/ui';
import type { MediaPipeFrameAnalysis } from '@sentinel/shared';

export type CheckupCalibrationPanelProps = {
    isCalibrated: boolean;
    calibrationProgress: number;
    calibrationHoldDurationLabel: string;
    mediaPipeAnalysis: MediaPipeFrameAnalysis | null;
    calibrationFeedback?: string | null;
};

/**
 * Sub-component displaying identity scan calibration progress and status text.
 */
export function CheckupCalibrationPanel({
    isCalibrated,
    calibrationProgress,
    calibrationHoldDurationLabel,
    mediaPipeAnalysis,
    calibrationFeedback,
}: CheckupCalibrationPanelProps) {
    return (
        <div className="flex w-full flex-col gap-2 border-t pt-3">
            <div className="flex items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                    {isCalibrated ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    )}
                    <p className="text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase">
                        {isCalibrated
                            ? 'Calibration Successful'
                            : mediaPipeAnalysis?.status === 'ready'
                              ? 'Holding Position'
                              : 'Awaiting Alignment'}
                    </p>
                </div>
                {!isCalibrated && (
                    <span className="text-primary font-mono text-[10px] font-medium">
                        {calibrationProgress}%
                    </span>
                )}
            </div>

            {!isCalibrated ? (
                <div className="space-y-2">
                    <Progress value={calibrationProgress} className="h-1.5 rounded-full" />
                    <p className="text-foreground/90 text-center text-sm leading-5 font-medium">
                        {calibrationFeedback
                            ? calibrationFeedback
                            : mediaPipeAnalysis?.status === 'ready'
                              ? `Please stay still for ${calibrationHoldDurationLabel}...`
                              : 'Center your face in the guide to begin calibration'}
                    </p>
                </div>
            ) : (
                <p className="text-muted-foreground text-center text-sm leading-relaxed">
                    Your identity has been verified. You are now ready to continue to the lobby.
                </p>
            )}
        </div>
    );
}

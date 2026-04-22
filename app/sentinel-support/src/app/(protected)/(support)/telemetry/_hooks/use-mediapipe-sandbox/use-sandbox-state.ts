import { useMemo, useState } from 'react';
import type { MediaPipeFrameAnalysis, MediaPipeTelemetryPayload } from '@sentinel/shared';
import type { RuntimePhase } from '../../_types';

export function useSandboxState() {
    const [phase, setPhase] = useState<RuntimePhase>('idle');
    const [analysis, setAnalysis] = useState<MediaPipeFrameAnalysis | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isSlowInitialization, setIsSlowInitialization] = useState(false);
    const [latestPayload, setLatestPayload] = useState<MediaPipeTelemetryPayload | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [isCalibrated, setIsCalibrated] = useState(false);

    const actions = useMemo(
        () => ({
            setPhase,
            setAnalysis,
            setErrorMessage,
            setIsCameraActive,
            setIsSlowInitialization,
            setCalibrationProgress,
            setIsCalibrated,
            setLastUpdatedAt,
            setLatestPayload,
        }),
        [],
    );

    const values = useMemo(
        () => ({
            phase,
            analysis,
            errorMessage,
            isCameraActive,
            isSlowInitialization,
            calibrationProgress,
            isCalibrated,
            lastUpdatedAt,
            latestPayload,
        }),
        [
            phase,
            analysis,
            errorMessage,
            isCameraActive,
            isSlowInitialization,
            calibrationProgress,
            isCalibrated,
            lastUpdatedAt,
            latestPayload,
        ],
    );

    return { state: values, actions };
}

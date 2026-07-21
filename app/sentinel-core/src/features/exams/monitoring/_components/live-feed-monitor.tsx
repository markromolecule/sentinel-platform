'use client';

import { LiveVideoMonitor } from '@sentinel/ui';
import { useLiveInspectionViewer } from '@sentinel/hooks';

type LiveFeedMonitorProps = {
    examId: string;
    studentId: string;
    attemptId: string | null;
    enabled: boolean;
};

export function LiveFeedMonitor({ examId, studentId, attemptId, enabled }: LiveFeedMonitorProps) {
    const viewer = useLiveInspectionViewer({ examId, studentId, attemptId, enabled });

    return (
        <LiveVideoMonitor
            state={viewer.state}
            reason={viewer.reason}
            connectionQuality={viewer.connectionQuality}
            videoRef={viewer.setVideoRef}
            onStart={viewer.start}
            onStop={viewer.stop}
            onRetry={viewer.retry}
            disabledExplanation={viewer.disabledExplanation}
        />
    );
}

'use client';

import { Eye } from 'lucide-react';
import { useApi, useAuth, useStudentLiveInspectionPublisher } from '@sentinel/hooks';
import { useStudentExamMediaPipeStream } from './student-exam-mediapipe-provider';

type StudentLiveInspectionBridgeProps = {
    sessionId: string | null;
    attemptId: string | null;
    enabled: boolean;
};

export function StudentLiveInspectionBridge({
    sessionId,
    attemptId,
    enabled,
}: StudentLiveInspectionBridgeProps) {
    const apiClient = useApi();
    const { supabase } = useAuth();
    const { getLiveVideoTrack } = useStudentExamMediaPipeStream();
    const publisher = useStudentLiveInspectionPublisher({
        supabase,
        apiClient,
        sessionId,
        attemptId,
        enabled,
        getLiveVideoTrack,
    });

    if (!publisher.isLive) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="border-border bg-background/95 text-foreground fixed right-4 bottom-4 z-50 flex max-w-xs items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur"
        >
            <Eye className="text-primary h-4 w-4" aria-hidden="true" />
            <span>Camera being viewed live by an authorized proctor</span>
        </div>
    );
}

import { useState } from 'react';
import { useApi } from '@sentinel/hooks';
import { ingestTelemetryEvent } from '@sentinel/services';
import { toast } from 'sonner';
import type { TelemetryEventIngestionRequest } from '@sentinel/shared';

export function useIngestionDryRun(currentPreviewPayload: TelemetryEventIngestionRequest) {
    const apiClient = useApi();
    const [dispatchSessionId, setDispatchSessionId] = useState('');
    const [dispatchStudentId, setDispatchStudentId] = useState('');
    const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
    const [dispatchError, setDispatchError] = useState<string | null>(null);
    const [isDispatching, setIsDispatching] = useState(false);

    async function handleDispatchPreview() {
        const examSessionId = dispatchSessionId.trim();
        const studentId = dispatchStudentId.trim();

        if (!examSessionId || !studentId) {
            setDispatchError('Enter both a target exam session ID and a target student user ID.');
            setDispatchStatus(null);
            return;
        }

        setIsDispatching(true);
        setDispatchError(null);
        setDispatchStatus(null);

        try {
            await ingestTelemetryEvent(apiClient, {
                ...currentPreviewPayload,
                examSessionId,
                studentId,
                timestamp: new Date().toISOString(),
            });

            const successMessage = `Preview event ${currentPreviewPayload.eventType} accepted for processing.`;
            setDispatchStatus(successMessage);
            toast.success(successMessage);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Preview dispatch failed. Confirm the target attempt is active and the authenticated user matches the student ID.';
            setDispatchError(message);
            toast.error(message);
        } finally {
            setIsDispatching(false);
        }
    }

    return {
        dispatchSessionId,
        setDispatchSessionId,
        dispatchStudentId,
        setDispatchStudentId,
        dispatchStatus,
        dispatchError,
        isDispatching,
        handleDispatchPreview,
    };
}

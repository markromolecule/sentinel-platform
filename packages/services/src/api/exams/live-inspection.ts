import type {
    LiveInspectionConnectionResponse,
    LiveInspectionDirective,
    LiveInspectionFailureAck,
    LiveInspectionReadyAck,
    LiveInspectionStaffStatus,
} from '@sentinel/shared/schema';
import type { ApiClientType } from '../../api-client';
import type { ApiExamResponse } from './types';

export type StartLiveInspectionPayload = {
    examId: string;
    attemptId: string;
};

export type LiveInspectionLeasePayload = {
    examId: string;
    leaseId: string;
};

export type StudentLiveInspectionSessionPayload = {
    sessionId: string;
};

export type PublisherConnectionPayload = StudentLiveInspectionSessionPayload & {
    leaseId: string;
    revision: number;
};

export type PublisherFailurePayload = PublisherConnectionPayload & {
    errorCode: string;
};

/**
 * Starts a staff-owned live inspection lease for one exam attempt.
 */
export async function startLiveInspection(
    apiClient: ApiClientType,
    payload: StartLiveInspectionPayload,
) {
    const response: ApiExamResponse<LiveInspectionStaffStatus> = await apiClient(
        `/exams/${payload.examId}/monitoring/live-inspections`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attemptId: payload.attemptId }),
        },
    );

    return response.data;
}

/**
 * Fetches redacted staff-visible live inspection status.
 */
export async function getLiveInspectionStatus(
    apiClient: ApiClientType,
    args: { examId: string; attemptId?: string; leaseId?: string },
) {
    const searchParams = new URLSearchParams();
    if (args.attemptId) searchParams.set('attemptId', args.attemptId);
    if (args.leaseId) searchParams.set('leaseId', args.leaseId);
    const query = searchParams.toString();
    const response: ApiExamResponse<LiveInspectionStaffStatus> = await apiClient(
        `/exams/${args.examId}/monitoring/live-inspections/status${query ? `?${query}` : ''}`,
    );

    return response.data;
}

/**
 * Creates a viewer connection token without storing it in a query cache.
 */
export async function createLiveInspectionViewerConnection(
    apiClient: ApiClientType,
    payload: LiveInspectionLeasePayload,
) {
    const response: ApiExamResponse<LiveInspectionConnectionResponse> = await apiClient(
        `/exams/${payload.examId}/monitoring/live-inspections/${payload.leaseId}/viewer-connection`,
        { method: 'POST' },
    );

    return response.data;
}

/**
 * Stops one live inspection lease.
 */
export async function stopLiveInspection(
    apiClient: ApiClientType,
    payload: LiveInspectionLeasePayload,
) {
    const response: ApiExamResponse<LiveInspectionStaffStatus> = await apiClient(
        `/exams/${payload.examId}/monitoring/live-inspections/${payload.leaseId}/stop`,
        { method: 'POST' },
    );

    return response.data;
}

/**
 * Fetches the student's private directive for an active inspection.
 */
export async function getStudentLiveInspectionDirective(
    apiClient: ApiClientType,
    payload: StudentLiveInspectionSessionPayload,
) {
    const response: ApiExamResponse<LiveInspectionDirective> = await apiClient(
        '/examination/flow/live-inspections/directive',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        },
    );

    return response.data;
}

/**
 * Creates a camera-only publisher connection token without query caching.
 */
export async function createLiveInspectionPublisherConnection(
    apiClient: ApiClientType,
    payload: PublisherConnectionPayload,
) {
    const response: ApiExamResponse<LiveInspectionConnectionResponse> = await apiClient(
        '/examination/flow/live-inspections/publisher-connection',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        },
    );

    return response.data;
}

/**
 * Acknowledges that the student publisher is ready.
 */
export async function acknowledgeLiveInspectionPublisherReady(
    apiClient: ApiClientType,
    payload: PublisherConnectionPayload,
) {
    const response: ApiExamResponse<LiveInspectionReadyAck> = await apiClient(
        '/examination/flow/live-inspections/publisher-ready',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        },
    );

    return response.data;
}

/**
 * Acknowledges publisher failure with a bounded error code.
 */
export async function acknowledgeLiveInspectionPublisherFailure(
    apiClient: ApiClientType,
    payload: PublisherFailurePayload,
) {
    const response: ApiExamResponse<LiveInspectionFailureAck> = await apiClient(
        '/examination/flow/live-inspections/publisher-failure',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        },
    );

    return response.data;
}

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { buildStudentHistoryAttemptHref } from '@/lib/routes/student-history-routes';
import {
    clearStoredExamSession,
    readStoredExamSession,
    readStoredLobbyEntry,
    consumeStoredLobbyEntry,
    clearStoredReconnectIntent,
} from '../_lib/exam-session-storage';
import { clearStoredExamTurnInPreview } from '../_lib/exam-turn-in-storage';
import {
    buildStudentExamHref,
    readStoredStudentExamFlow,
    resolveStoredStudentExamMediaPipeActivation,
    resolveStudentExamAdmissionState,
    resolveStudentExamMediaPipeSandbox,
    resolveStudentExamStage,
    type StudentExamStage,
} from '../_lib/student-exam-flow';
import { useStudentExamData } from './use-student-exam-data';

// Module-level in-memory cache to survive React StrictMode remounts in the same page lifecycle
const consumedLobbyEntriesInMemory = new Set<string>();

/**
 * Shared route-guard hook that computes the deterministic single target stage
 * and handles idempotent redirects for student exam pages.
 */
export function useStudentExamStageGuard(requestedStage: StudentExamStage) {
    const router = useRouter();
    const studentData = useStudentExamData();
    const {
        examId,
        exam,
        configuration,
        mediaPipeSandbox,
        isLoading,
        configQueryError,
        isExamError,
    } = studentData;

    const storedFlow = useMemo(() => {
        if (typeof window === 'undefined') {
            return {
                privacyAccepted: false,
                checkupCompleted: false,
                mediaPipeActivatedAt: null,
                mediaPipeCalibrationCompletedAt: null,
                mediaPipeActivationSource: null,
                mediaPipeCalibrationProfile: null,
            };
        }
        return readStoredStudentExamFlow(examId);
    }, [examId]);

    const storedSession = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return readStoredExamSession(examId);
    }, [examId]);

    const lobbyEntry = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const entry = readStoredLobbyEntry(examId);
        if (!entry) return null;
        const isFresh = !entry.consumedAt || consumedLobbyEntriesInMemory.has(entry.token);
        if (isFresh) {
            return entry;
        }
        return null;
    }, [examId]);

    const effectiveMediaPipeSandbox = useMemo(
        () =>
            resolveStudentExamMediaPipeSandbox({
                configuration,
                mediaPipeSandbox,
            }),
        [configuration, mediaPipeSandbox],
    );

    const requiresMediaPipe = Boolean(
        effectiveMediaPipeSandbox.enabled && effectiveMediaPipeSandbox.captureDuringCheckup,
    );

    const mediaPipeActivation = useMemo(
        () =>
            resolveStoredStudentExamMediaPipeActivation({
                examId,
                required: requiresMediaPipe,
            }),
        [examId, requiresMediaPipe],
    );

    const resolution = useMemo(() => {
        return resolveStudentExamStage({
            requestedStage,
            privacyAccepted: storedFlow.privacyAccepted,
            checkupCompleted: storedFlow.checkupCompleted,
            mediaPipeStatus: mediaPipeActivation.status,
            admissionMode: configuration?.lobbyAdmissionMode ?? null,
            admissionState: resolveStudentExamAdmissionState(exam?.runtimeAccess),
            runtimeAccess: exam?.runtimeAccess
                ? {
                    canStart: exam.runtimeAccess.canStart,
                    canResume: exam.runtimeAccess.canResume,
                    isAttemptActive: exam.runtimeAccess.hasActiveAttempt,
                    isTurnedIn: exam.status === 'turned_in',
                    reconnectCount:
                        typeof exam.runtimeAccess.totalReconnectAttempts === 'number' &&
                            typeof exam.runtimeAccess.reconnectAttemptsRemaining === 'number'
                            ? Math.max(
                                0,
                                exam.runtimeAccess.totalReconnectAttempts -
                                exam.runtimeAccess.reconnectAttemptsRemaining,
                            )
                            : 0,
                    maxReconnectAttempts: configuration?.maxReconnectAttempts ?? 3,
                    state: exam.runtimeAccess.state,
                    blockedCode: studentData.blockedState.code,
                }
                : {
                    isTurnedIn: exam?.status === 'turned_in',
                    blockedCode: studentData.blockedState.code,
                },
            configQueryError,
            examQueryError: isExamError,
            hasFreshLobbyEntry: Boolean(lobbyEntry),
            lobbyEntrySessionId: lobbyEntry?.sessionId,
            storedSessionId: storedSession?.sessionId,
        });
    }, [
        requestedStage,
        storedFlow.privacyAccepted,
        storedFlow.checkupCompleted,
        mediaPipeActivation.status,
        configuration?.lobbyAdmissionMode,
        configuration?.maxReconnectAttempts,
        exam?.runtimeAccess,
        exam?.status,
        studentData.blockedState.code,
        configQueryError,
        isExamError,
        lobbyEntry,
        storedSession,
    ]);

    useEffect(() => {
        if (requestedStage === 'attempt' && lobbyEntry && !lobbyEntry.consumedAt) {
            consumeStoredLobbyEntry(examId);
            consumedLobbyEntriesInMemory.add(lobbyEntry.token);
        }
    }, [requestedStage, examId, lobbyEntry]);

    const redirectedTargetRef = useRef<string | null>(null);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (resolution.targetStage === 'result' && exam?.attemptId) {
            if (redirectedTargetRef.current !== `result:${exam.attemptId}`) {
                redirectedTargetRef.current = `result:${exam.attemptId}`;
                clearStoredExamTurnInPreview(examId);
                clearStoredExamSession(examId);
                clearStoredReconnectIntent(examId);
                router.replace(buildStudentHistoryAttemptHref(exam.attemptId));
            }
            return;
        }

        if (resolution.shouldRedirect && resolution.targetStage !== requestedStage) {
            const href = buildStudentExamHref(examId, resolution.targetStage as StudentExamStage);
            if (redirectedTargetRef.current !== href) {
                redirectedTargetRef.current = href;
                router.replace(href);
            }
        }
    }, [exam?.attemptId, examId, isLoading, requestedStage, resolution, router]);

    const isRedirecting = !isLoading && resolution.shouldRedirect;

    return {
        ...studentData,
        storedFlow,
        mediaPipeActivation,
        resolution,
        isResolving: isLoading || isRedirecting,
    };
}

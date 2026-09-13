import { vi, describe, expect, it } from 'vitest';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import {
    getMobileExamLobbyEntryLabel,
    generateResumeRequestId,
    isHardRuntimeBlock,
    resolveLobbyAdmissionStatus,
    canEnterMobileExamLobby,
    executeLobbySessionStart,
} from './mobile-exam-lobby';

vi.mock('@sentinel/services', () => ({
    startExamSession: vi.fn().mockResolvedValue({ sessionId: 'sess-abc', isResumed: false }),
}));

vi.mock('@/features/exam/lib/mobile-exam-storage', () => ({
    writeStoredMobileExamSession: vi.fn().mockResolvedValue(undefined),
}));

function runtimeAccess(overrides: Partial<ExamRuntimeAccess>): ExamRuntimeAccess {
    return {
        state: 'lobby_waiting',
        reasonCode: 'LOBBY_WAITING',
        message: '',
        canStart: false,
        canResume: false,
        hasActiveAttempt: false,
        ...overrides,
    };
}

describe('mobile exam lobby', () => {
    describe('getMobileExamLobbyEntryLabel', () => {
        it('shows Continue when admission allows entry even if the previous state is lobby_waiting', () => {
            expect(
                getMobileExamLobbyEntryLabel({
                    isStartingSession: false,
                    canEnterExam: true,
                    runtimeAccess: runtimeAccess({
                        state: 'lobby_waiting',
                        canStart: true,
                        reasonCode: 'LOBBY_APPROVED',
                    }),
                }),
            ).toBe('Continue');
        });

        it.each([
            ['lobby_waiting', 'Waiting for Approval'],
            ['before_start', 'Awaiting Start Time'],
            ['closed', 'Exam Closed'],
            ['locked', 'Exam Locked'],
        ] as const)('maps %s to the expected disabled label', (state, label) => {
            expect(
                getMobileExamLobbyEntryLabel({
                    isStartingSession: false,
                    canEnterExam: false,
                    runtimeAccess: runtimeAccess({ state }),
                }),
            ).toBe(label);
        });

        it('prefers resume and entering labels over other lobby states', () => {
            expect(
                getMobileExamLobbyEntryLabel({
                    isStartingSession: true,
                    canEnterExam: true,
                    runtimeAccess: runtimeAccess({ canResume: true }),
                }),
            ).toBe('Entering...');

            expect(
                getMobileExamLobbyEntryLabel({
                    isStartingSession: false,
                    canEnterExam: true,
                    runtimeAccess: runtimeAccess({ canResume: true }),
                }),
            ).toBe('Resume Exam');
        });
    });

    describe('generateResumeRequestId', () => {
        it('generates a valid UUID string format', () => {
            const uuid = generateResumeRequestId();
            expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        });
    });

    describe('isHardRuntimeBlock', () => {
        it('identifies hard blocks correctly', () => {
            expect(isHardRuntimeBlock('closed')).toBe(true);
            expect(isHardRuntimeBlock('locked')).toBe(true);
            expect(isHardRuntimeBlock('before_start')).toBe(true);
            expect(isHardRuntimeBlock('lobby_waiting')).toBe(false);
            expect(isHardRuntimeBlock('open')).toBe(false);
            expect(isHardRuntimeBlock(undefined)).toBe(false);
        });
    });

    describe('resolveLobbyAdmissionStatus', () => {
        it('returns APPROVED when lobby admission mode is not INSTRUCTOR_GATED', () => {
            const status = resolveLobbyAdmissionStatus({
                configuration: { lobbyAdmissionMode: 'DIRECT' } as any,
                admissionDataStatus: undefined,
            });
            expect(status).toBe('APPROVED');
        });

        it('returns admissionDataStatus when provided', () => {
            const status = resolveLobbyAdmissionStatus({
                configuration: { lobbyAdmissionMode: 'INSTRUCTOR_GATED' } as any,
                admissionDataStatus: 'WAITING',
            });
            expect(status).toBe('WAITING');
        });

        it('defaults to null when INSTRUCTOR_GATED and no admission data exists', () => {
            const status = resolveLobbyAdmissionStatus({
                configuration: { lobbyAdmissionMode: 'INSTRUCTOR_GATED' } as any,
                admissionDataStatus: undefined,
            });
            expect(status).toBeNull();
        });
    });

    describe('canEnterMobileExamLobby', () => {
        it('blocks entry if MediaPipe or audio is not ready', () => {
            expect(
                canEnterMobileExamLobby({
                    runtimeAccess: runtimeAccess({ canStart: true }),
                    admissionStatus: 'APPROVED',
                    requiresInstructorAdmission: false,
                    isMediaPipeCalibrated: false,
                    isAudioReady: true,
                }),
            ).toBe(false);

            expect(
                canEnterMobileExamLobby({
                    runtimeAccess: runtimeAccess({ canStart: true }),
                    admissionStatus: 'APPROVED',
                    requiresInstructorAdmission: false,
                    isMediaPipeCalibrated: true,
                    isAudioReady: false,
                }),
            ).toBe(false);
        });

        it('blocks entry on hard runtime block even if ready and approved', () => {
            expect(
                canEnterMobileExamLobby({
                    runtimeAccess: runtimeAccess({ state: 'locked', canStart: true }),
                    admissionStatus: 'APPROVED',
                    requiresInstructorAdmission: false,
                    isMediaPipeCalibrated: true,
                    isAudioReady: true,
                }),
            ).toBe(false);
        });

        it('requires instructor admission approval when instructor gated', () => {
            expect(
                canEnterMobileExamLobby({
                    runtimeAccess: runtimeAccess({ canStart: true }),
                    admissionStatus: 'WAITING',
                    requiresInstructorAdmission: true,
                    isMediaPipeCalibrated: true,
                    isAudioReady: true,
                }),
            ).toBe(false);

            expect(
                canEnterMobileExamLobby({
                    runtimeAccess: runtimeAccess({ canStart: true }),
                    admissionStatus: 'APPROVED',
                    requiresInstructorAdmission: true,
                    isMediaPipeCalibrated: true,
                    isAudioReady: true,
                }),
            ).toBe(true);
        });
    });

    describe('executeLobbySessionStart', () => {
        it('calls startExamSession, caches session, and navigates router', async () => {
            const mockRouter = { replace: vi.fn() };
            const result = await executeLobbySessionStart({
                apiClient: {} as any,
                examId: 'exam-123',
                router: mockRouter,
            });

            expect(result).toEqual({ sessionId: 'sess-abc', isResumed: false });
            expect(mockRouter.replace).toHaveBeenCalledWith('/exam/exam-123/session/sess-abc');
        });
    });
});

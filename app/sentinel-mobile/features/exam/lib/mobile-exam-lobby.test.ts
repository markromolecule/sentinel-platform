import { describe, expect, it } from 'vitest';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { getMobileExamLobbyEntryLabel } from './mobile-exam-lobby';

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

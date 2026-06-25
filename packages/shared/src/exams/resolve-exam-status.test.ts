import { describe, expect, it } from 'vitest';
import { resolveStudentExamStatus } from './resolve-exam-status';

describe('resolveStudentExamStatus', () => {
    it('returns upcoming when the scheduled date is still in the future', () => {
        expect(
            resolveStudentExamStatus({
                status: 'published',
                scheduledDate: '2099-06-30T10:00:00.000Z',
                endDateTime: '2099-06-30T11:00:00.000Z',
                durationMinutes: 60,
                now: new Date('2099-06-30T09:00:00.000Z'),
            }),
        ).toBe('upcoming');
    });

    it('returns available once the exam reaches its scheduled start time', () => {
        expect(
            resolveStudentExamStatus({
                status: 'published',
                scheduledDate: '2099-06-30T10:00:00.000Z',
                endDateTime: '2099-06-30T11:00:00.000Z',
                durationMinutes: 60,
                now: new Date('2099-06-30T10:15:00.000Z'),
            }),
        ).toBe('available');
    });

    it('returns past_due after the end cutoff even if the upstream status is still available', () => {
        expect(
            resolveStudentExamStatus({
                status: 'available',
                scheduledDate: '2099-06-30T10:00:00.000Z',
                endDateTime: '2099-06-30T11:00:00.000Z',
                durationMinutes: 60,
                now: new Date('2099-06-30T11:00:00.000Z'),
            }),
        ).toBe('past_due');
    });

    it('returns turned_in for completed attempts regardless of schedule state', () => {
        expect(
            resolveStudentExamStatus({
                status: 'published',
                scheduledDate: '2099-06-30T10:00:00.000Z',
                endDateTime: '2099-06-30T11:00:00.000Z',
                durationMinutes: 60,
                attemptCompletedAt: '2099-06-30T10:20:00.000Z',
                now: new Date('2099-06-30T12:00:00.000Z'),
            }),
        ).toBe('turned_in');
    });

    it('returns in-progress when the attempt is actively running', () => {
        expect(
            resolveStudentExamStatus({
                status: 'published',
                scheduledDate: '2099-06-30T10:00:00.000Z',
                endDateTime: '2099-06-30T11:00:00.000Z',
                durationMinutes: 60,
                attemptStatus: 'in-progress',
                now: new Date('2099-06-30T10:20:00.000Z'),
            }),
        ).toBe('in-progress');
    });
});

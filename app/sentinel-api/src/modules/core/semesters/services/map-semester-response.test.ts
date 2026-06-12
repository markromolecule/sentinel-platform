import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mapSemesterResponse } from './map-semester-response';

describe('mapSemesterResponse', () => {
    const baseRecord = {
        term_id: 'term-123',
        academic_year: '2025-2026',
        semester: '1st Semester',
        is_active: true,
        start_date: '2025-09-01T00:00:00Z',
        end_date: '2026-02-01T00:00:00Z',
        created_at: '2025-08-01T00:00:00Z',
        institution_id: 'inst-123',
    };

    beforeEach(() => {
        // Freeze time to 2026-01-01T00:00:00Z
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should map standard fields correctly', () => {
        const result = mapSemesterResponse(baseRecord);
        expect(result.term_id).toBe('term-123');
        expect(result.academic_year).toBe('2025-2026');
        expect(result.semester).toBe('1st Semester');
        expect(result.institution_id).toBe('inst-123');
    });

    it('should return is_active: true when is_active in DB is true and end_date is in the future', () => {
        const record = {
            ...baseRecord,
            is_active: true,
            end_date: '2026-02-01T00:00:00Z', // In the future (frozen time: 2026-01-01)
        };
        const result = mapSemesterResponse(record);
        expect(result.is_active).toBe(true);
    });

    it('should return is_active: false when is_active in DB is true but end_date has passed', () => {
        const record = {
            ...baseRecord,
            is_active: true,
            end_date: '2025-12-01T00:00:00Z', // In the past (frozen time: 2026-01-01)
        };
        const result = mapSemesterResponse(record);
        expect(result.is_active).toBe(false);
    });

    it('should return is_active: true when is_active in DB is true and end_date is null', () => {
        const record = {
            ...baseRecord,
            is_active: true,
            end_date: null,
        };
        const result = mapSemesterResponse(record);
        expect(result.is_active).toBe(true);
    });

    it('should return is_active: false when is_active in DB is false, regardless of end_date', () => {
        const recordFuture = {
            ...baseRecord,
            is_active: false,
            end_date: '2026-02-01T00:00:00Z',
        };
        const recordPast = {
            ...baseRecord,
            is_active: false,
            end_date: '2025-12-01T00:00:00Z',
        };
        expect(mapSemesterResponse(recordFuture).is_active).toBe(false);
        expect(mapSemesterResponse(recordPast).is_active).toBe(false);
    });

    it('should return is_active: null when is_active in DB is null, regardless of end_date', () => {
        const recordFuture = {
            ...baseRecord,
            is_active: null,
            end_date: '2026-02-01T00:00:00Z',
        };
        const recordPast = {
            ...baseRecord,
            is_active: null,
            end_date: '2025-12-01T00:00:00Z',
        };
        expect(mapSemesterResponse(recordFuture).is_active).toBeNull();
        expect(mapSemesterResponse(recordPast).is_active).toBeNull();
    });
});

import { describe, expect, it } from 'vitest';
import { buildDefaultTitle, countInclusiveDays, validateReportRequest } from './index';

describe('Reports Analytics Utilities', () => {
    describe('buildDefaultTitle', () => {
        it('should build a default title containing current date', () => {
            const title = buildDefaultTitle();
            expect(title).toContain('Overall Analytics Report - ');
        });
    });

    describe('countInclusiveDays', () => {
        it('should return 0 when start or end date is missing', () => {
            expect(countInclusiveDays('', '2026-07-16')).toBe(0);
            expect(countInclusiveDays('2026-07-16', '')).toBe(0);
            expect(countInclusiveDays()).toBe(0);
        });

        it('should return 1 for the same start and end date', () => {
            expect(countInclusiveDays('2026-07-16', '2026-07-16')).toBe(1);
        });

        it('should return correct number of days for valid range', () => {
            expect(countInclusiveDays('2026-07-16', '2026-07-20')).toBe(5);
        });
    });

    describe('validateReportRequest', () => {
        it('should return error if institutionId is missing', () => {
            const errors = validateReportRequest({
                institutionId: '',
                title: 'Test Report',
                preset: 'LAST_30_DAYS',
                startDate: '',
                endDate: '',
            });
            expect(errors).toContain('Choose an institution before queueing a report.');
        });

        it('should return error if title is empty or only whitespace', () => {
            const errors = validateReportRequest({
                institutionId: 'inst-123',
                title: '   ',
                preset: 'LAST_30_DAYS',
                startDate: '',
                endDate: '',
            });
            expect(errors).toContain('Title is required.');
        });

        it('should require start and end date for CUSTOM preset', () => {
            const errors = validateReportRequest({
                institutionId: 'inst-123',
                title: 'Test Report',
                preset: 'CUSTOM',
                startDate: '',
                endDate: '',
            });
            expect(errors).toContain('Custom range requires both a start and end date.');
        });

        it('should return error if CUSTOM range dates are invalid', () => {
            const errors = validateReportRequest({
                institutionId: 'inst-123',
                title: 'Test Report',
                preset: 'CUSTOM',
                startDate: 'invalid-date',
                endDate: '2026-07-16',
            });
            expect(errors).toContain('Custom range must use valid dates.');
        });

        it('should return error if end date is before start date in CUSTOM preset', () => {
            const errors = validateReportRequest({
                institutionId: 'inst-123',
                title: 'Test Report',
                preset: 'CUSTOM',
                startDate: '2026-07-16',
                endDate: '2026-07-15',
            });
            expect(errors).toContain('End date must be the same as or later than the start date.');
        });

        it('should return error if CUSTOM range exceeds 366 days', () => {
            const errors = validateReportRequest({
                institutionId: 'inst-123',
                title: 'Test Report',
                preset: 'CUSTOM',
                startDate: '2026-01-01',
                endDate: '2027-01-05',
            });
            expect(errors).toContain('Custom range cannot exceed 366 days.');
        });

        it('should return no errors for valid input with standard preset', () => {
            const errors = validateReportRequest({
                institutionId: 'inst-123',
                title: 'Test Report',
                preset: 'LAST_30_DAYS',
                startDate: '',
                endDate: '',
            });
            expect(errors).toHaveLength(0);
        });

        it('should return no errors for valid CUSTOM range', () => {
            const errors = validateReportRequest({
                institutionId: 'inst-123',
                title: 'Test Report',
                preset: 'CUSTOM',
                startDate: '2026-07-16',
                endDate: '2026-07-20',
            });
            expect(errors).toHaveLength(0);
        });
    });
});

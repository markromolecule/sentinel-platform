import { ReportRequestInput } from '../_types';

/**
 * Builds the default title for the report containing the current local date.
 * @returns {string} The default report title.
 */
export function buildDefaultTitle(): string {
    return `Overall Analytics Report - ${new Date().toLocaleDateString()}`;
}

/**
 * Counts the number of inclusive days between a start date and end date.
 * @param {string} [startDate] - The start date string in YYYY-MM-DD format.
 * @param {string} [endDate] - The end date string in YYYY-MM-DD format.
 * @returns {number} The count of inclusive days, or 0 if either date is missing.
 */
export function countInclusiveDays(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) {
        return 0;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Validates the report request input.
 * @param {ReportRequestInput} input - The input parameters for report generation.
 * @returns {string[]} An array of validation error messages, empty if valid.
 */
export function validateReportRequest(input: ReportRequestInput): string[] {
    const errors: string[] = [];

    if (!input.institutionId) {
        errors.push('Choose an institution before queueing a report.');
    }

    if (!input.title.trim()) {
        errors.push('Title is required.');
    }

    if (input.preset === 'CUSTOM') {
        if (!input.startDate || !input.endDate) {
            errors.push('Custom range requires both a start and end date.');
        } else {
            const start = new Date(`${input.startDate}T00:00:00`);
            const end = new Date(`${input.endDate}T00:00:00`);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                errors.push('Custom range must use valid dates.');
            } else if (end < start) {
                errors.push('End date must be the same as or later than the start date.');
            } else if (countInclusiveDays(input.startDate, input.endDate) > 366) {
                errors.push('Custom range cannot exceed 366 days.');
            }
        }
    }

    return errors;
}

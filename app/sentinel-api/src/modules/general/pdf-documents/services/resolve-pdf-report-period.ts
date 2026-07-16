import { ReportPeriod } from '@sentinel/shared/types';

export interface ResolvedPdfReportPeriod {
    startAt: Date;
    endAtExclusive: Date;
    startDateStr: string;
    endDateStr: string;
    timezone: string;
}

/**
 * Resolves a ReportPeriod schema input into canonical UTC dates and local date strings in Asia/Manila.
 * 
 * @param period The ReportPeriod input
 * @returns The resolved date coordinates
 */
export function resolvePdfReportPeriod(period: ReportPeriod): ResolvedPdfReportPeriod {
    const timezone = 'Asia/Manila';
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const getTodayManila = (): Date => {
        const parts = formatter.formatToParts(new Date());
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        return new Date(`${year}-${month}-${day}T00:00:00+08:00`);
    };

    const formatLocalDate = (date: Date): string => {
        const parts = formatter.formatToParts(date);
        const y = parts.find(p => p.type === 'year')?.value;
        const m = parts.find(p => p.type === 'month')?.value;
        const d = parts.find(p => p.type === 'day')?.value;
        return `${y}-${m}-${d}`;
    };

    let startLocal: Date;
    let endLocal: Date;
    let startDateStr: string;
    let endDateStr: string;

    if (period.preset !== 'CUSTOM') {
        const today = getTodayManila();
        let daysToSubtract = 29; // default for LAST_30_DAYS

        if (period.preset === 'LAST_7_DAYS') {
            daysToSubtract = 6;
        } else if (period.preset === 'LAST_90_DAYS') {
            daysToSubtract = 89;
        }

        const start = new Date(today);
        start.setDate(today.getDate() - daysToSubtract);

        startLocal = start;
        endLocal = today;
        startDateStr = formatLocalDate(startLocal);
        endDateStr = formatLocalDate(endLocal);
    } else {
        if (!period.start_date || !period.end_date) {
            throw new Error('Start date and end date are required for custom period');
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(period.start_date) || !dateRegex.test(period.end_date)) {
            throw new Error('Dates must be in YYYY-MM-DD format');
        }

        startLocal = new Date(`${period.start_date}T00:00:00+08:00`);
        endLocal = new Date(`${period.end_date}T00:00:00+08:00`);

        if (isNaN(startLocal.getTime()) || isNaN(endLocal.getTime())) {
            throw new Error('Invalid custom dates provided');
        }

        if (endLocal < startLocal) {
            throw new Error('End date must be greater than or equal to start date');
        }

        const diffTime = endLocal.getTime() - startLocal.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 366) {
            throw new Error('Date range cannot exceed 366 days');
        }

        startDateStr = period.start_date;
        endDateStr = period.end_date;
    }

    const startAt = new Date(startLocal.getTime());
    const endAtExclusive = new Date(endLocal.getTime());
    endAtExclusive.setDate(endLocal.getDate() + 1);

    return {
        startAt,
        endAtExclusive,
        startDateStr,
        endDateStr,
        timezone,
    };
}

import type { subject_offering_status } from '@sentinel/db';

type TermWindow = {
    start_date: Date | string | null;
    end_date: Date | string | null;
};

function normalizeDate(value: Date | string | null) {
    if (!value) {
        return null;
    }

    const normalized = value instanceof Date ? value : new Date(value);
    return Number.isNaN(normalized.getTime()) ? null : normalized;
}

export function deriveSubjectOfferingStatus(term: TermWindow): subject_offering_status {
    const now = new Date();
    const startDate = normalizeDate(term.start_date);
    const endDate = normalizeDate(term.end_date);

    if (endDate && endDate.getTime() < now.getTime()) {
        return 'CLOSED';
    }

    if (!startDate && !endDate) {
        return 'DRAFT';
    }

    if (startDate && startDate.getTime() > now.getTime()) {
        return 'DRAFT';
    }

    return 'OPEN';
}

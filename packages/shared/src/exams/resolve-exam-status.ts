import type { ExamStatus } from '../types';

export type ResolveExamStatusArgs = {
    status?: string | null;
    scheduledDate?: Date | string | null;
    endDateTime?: Date | string | null;
    durationMinutes?: number | null;
    now?: Date;
};

const AUTO_ARCHIVE_STATUSES = new Set<ExamStatus>(['published']);

function parseDateValue(value?: Date | string | null): Date | null {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeExamStatus(status?: string | null): ExamStatus {
    return (status?.toLowerCase().replace('_', '-') ?? 'draft') as ExamStatus;
}

export function getExamArchiveCutoff(args: ResolveExamStatusArgs): Date | null {
    const explicitEndDateTime = parseDateValue(args.endDateTime);

    if (explicitEndDateTime) {
        return explicitEndDateTime;
    }

    const scheduledDate = parseDateValue(args.scheduledDate);

    if (!scheduledDate) {
        return null;
    }

    if (typeof args.durationMinutes === 'number' && args.durationMinutes > 0) {
        return new Date(scheduledDate.getTime() + args.durationMinutes * 60_000);
    }

    return scheduledDate;
}

export function isExamPastScheduleWindow(args: ResolveExamStatusArgs) {
    const archiveCutoff = getExamArchiveCutoff(args);

    if (!archiveCutoff) {
        return false;
    }

    const now = args.now ?? new Date();

    return archiveCutoff.getTime() <= now.getTime();
}

export function resolveExamStatus(args: ResolveExamStatusArgs): ExamStatus {
    const normalizedStatus = normalizeExamStatus(args.status);

    if (!AUTO_ARCHIVE_STATUSES.has(normalizedStatus)) {
        return normalizedStatus;
    }

    return isExamPastScheduleWindow(args) ? 'archived' : normalizedStatus;
}

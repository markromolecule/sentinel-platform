import type { ExamStatus, StudentExamStatus } from '../types';

export type ResolveExamStatusArgs = {
    status?: string | null;
    scheduledDate?: Date | string | null;
    endDateTime?: Date | string | null;
    durationMinutes?: number | null;
    now?: Date;
};

export type ResolveStudentExamStatusArgs = ResolveExamStatusArgs & {
    attemptCompletedAt?: Date | string | null;
    attemptStatus?: string | null;
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
    const normalized =
        status
            ?.trim()
            .toLowerCase()
            .replace(/[\s-]+/g, '_') ?? 'draft';

    switch (normalized) {
        case 'in_progress':
            return 'in-progress';
        case 'past_due':
            return 'past_due';
        case 'turned_in':
            return 'turned_in';
        default:
            return normalized as ExamStatus;
    }
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

export function hasCompletedStudentExamAttempt(args: ResolveStudentExamStatusArgs) {
    const completedAt = parseDateValue(args.attemptCompletedAt);

    if (completedAt) {
        return true;
    }

    return normalizeExamStatus(args.attemptStatus) === 'completed';
}

export function resolveStudentExamStatus(args: ResolveStudentExamStatusArgs): StudentExamStatus {
    if (hasCompletedStudentExamAttempt(args)) {
        return 'turned_in';
    }

    if (normalizeExamStatus(args.attemptStatus) === 'in-progress') {
        return 'in-progress';
    }

    if (isExamPastScheduleWindow(args)) {
        return 'past_due';
    }

    const scheduledDate = parseDateValue(args.scheduledDate);
    const now = args.now ?? new Date();

    if (!scheduledDate) {
        return 'available';
    }

    return scheduledDate.getTime() <= now.getTime() ? 'available' : 'upcoming';
}

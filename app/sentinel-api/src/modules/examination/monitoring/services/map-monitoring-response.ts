import {
    TELEMETRY_INCIDENT_LABELS,
    type TelemetryIncidentRecord,
    type TelemetryIncidentType,
} from '@sentinel/shared';
import type {
    MonitoringExam,
    MonitoringIncident,
    MonitoringOverview,
    MonitoringStudentDetail,
    MonitoringStudentSummary,
    MonitoringStudentStatus,
} from '../monitoring.dto';

const DISCONNECTED_WINDOW_MS = 5 * 60 * 1000;

export type MonitoringStudentRow = {
    student_user_id: string | null;
    student_record_id: string;
    student_number: string;
    first_name: string | null;
    last_name: string | null;
    last_seen_at: Date | string | null;
    attempt_id: string;
    attempt_status: string | null;
    started_at: Date | string | null;
    completed_at: Date | string | null;
    time_spent_minutes: number | null;
    score: number | null;
    total_score: number | null;
    incident_count: number | string | null;
    open_incident_count: number | string | null;
    has_high_severity: boolean | null;
    latest_incident_type: TelemetryIncidentType | null;
    latest_incident_at: Date | string | null;
};

function toIsoDate(value: Date | string | null | undefined) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toDate(value: Date | string | null | undefined) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function getLatestActivityAt(row: MonitoringStudentRow) {
    const candidates = [
        toDate(row.last_seen_at),
        toDate(row.latest_incident_at),
        toDate(row.completed_at),
        toDate(row.started_at),
    ].filter((value): value is Date => value instanceof Date);

    if (candidates.length === 0) {
        return null;
    }

    return new Date(Math.max(...candidates.map((candidate) => candidate.getTime())));
}

function resolveMonitoringStatus(args: {
    attemptStatus: string | null;
    lastActivityAt: Date | null;
    openIncidentCount: number;
    hasHighSeverity: boolean;
}): MonitoringStudentStatus {
    const attemptStatus = args.attemptStatus?.toUpperCase();
    const isFlagged = args.openIncidentCount > 0 || args.hasHighSeverity;

    if (isFlagged) {
        return 'flagged';
    }

    if (attemptStatus === 'COMPLETED') {
        return 'submitted';
    }

    if (
        attemptStatus === 'IN_PROGRESS' &&
        args.lastActivityAt &&
        Date.now() - args.lastActivityAt.getTime() > DISCONNECTED_WINDOW_MS
    ) {
        return 'disconnected';
    }

    return 'active';
}

function resolveProgress(row: MonitoringStudentRow, durationMinutes: number) {
    if (row.completed_at || row.attempt_status?.toUpperCase() === 'COMPLETED') {
        return 100;
    }

    const recordedTimeSpentMinutes = Number(row.time_spent_minutes ?? 0);
    const startedAt = toDate(row.started_at);
    const liveElapsedMinutes = startedAt
        ? Math.max(0, Math.ceil((Date.now() - startedAt.getTime()) / 60000))
        : 0;
    const timeSpentMinutes =
        recordedTimeSpentMinutes > 0 ? recordedTimeSpentMinutes : liveElapsedMinutes;

    if (durationMinutes <= 0 || timeSpentMinutes <= 0) {
        return 0;
    }

    const calculatedProgress = Math.round((timeSpentMinutes / durationMinutes) * 100);
    return Math.max(0, Math.min(calculatedProgress, 99));
}

function getRelativeTimeLabel(value: Date | null) {
    if (!value) {
        return 'No recent activity';
    }

    const diffMs = Date.now() - value.getTime();
    const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

    if (diffMinutes <= 0) {
        return 'Just now';
    }

    if (diffMinutes === 1) {
        return '1 min ago';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    const diffHours = Math.round(diffMinutes / 60);

    if (diffHours === 1) {
        return '1 hour ago';
    }

    if (diffHours < 24) {
        return `${diffHours} hours ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
}

function normalizeIncidentSeverity(
    severity: string | null | undefined,
): MonitoringIncident['severity'] {
    switch (severity?.toUpperCase()) {
        case 'HIGH':
            return 'high';
        case 'LOW':
            return 'low';
        default:
            return 'medium';
    }
}

function resolveStudentNames(row: MonitoringStudentRow) {
    const firstName = row.first_name?.trim() || 'Unknown';
    const lastName = row.last_name?.trim() || 'Student';

    return {
        firstName,
        lastName,
    };
}

export function mapMonitoringStudentSummary(
    row: MonitoringStudentRow,
    durationMinutes: number,
): MonitoringStudentSummary {
    const lastActivityAt = getLatestActivityAt(row);
    const incidentCount = Number(row.incident_count ?? 0);
    const openIncidentCount = Number(row.open_incident_count ?? 0);
    const hasHighSeverity = Boolean(row.has_high_severity);
    const status = resolveMonitoringStatus({
        attemptStatus: row.attempt_status,
        lastActivityAt,
        openIncidentCount,
        hasHighSeverity,
    });
    const { firstName, lastName } = resolveStudentNames(row);

    return {
        id: row.student_user_id ?? row.student_record_id,
        attemptId: row.attempt_id,
        studentNo: row.student_number,
        firstName,
        lastName,
        status,
        progress: resolveProgress(row, durationMinutes),
        incidentCount,
        openIncidentCount,
        latestIncidentType: row.latest_incident_type ?? null,
        lastActivityAt: toIsoDate(lastActivityAt),
        startedAt: toIsoDate(row.started_at),
        completedAt: toIsoDate(row.completed_at),
        timeSpentMinutes: row.time_spent_minutes ?? null,
        score: row.score ?? null,
        totalScore: row.total_score ?? null,
    };
}

export function mapMonitoringIncident(incident: TelemetryIncidentRecord): MonitoringIncident {
    const details = incident.details as any;
    return {
        id: incident.incidentId,
        type: incident.incidentType,
        timestamp: toIsoDate(incident.timestamp) ?? new Date().toISOString(),
        description: details?.lastEvent?.metadata?.description || TELEMETRY_INCIDENT_LABELS[incident.incidentType],
        severity: normalizeIncidentSeverity(incident.severity),
        snapshotUrl: incident.evidenceUrl ?? null,
        evidenceUrl: incident.evidenceUrl ?? null,
        status: incident.status ?? null,
        occurrenceCount: details?.occurrenceCount ?? 1,
    };
}

export function mapMonitoringStudentDetail(
    row: MonitoringStudentRow,
    durationMinutes: number,
    incidents: TelemetryIncidentRecord[],
): MonitoringStudentDetail {
    return {
        ...mapMonitoringStudentSummary(row, durationMinutes),
        flags: incidents.map(mapMonitoringIncident),
    };
}

export function buildMonitoringOverview(args: {
    exam: MonitoringExam;
    students: MonitoringStudentSummary[];
}): MonitoringOverview {
    const stats = args.students.reduce(
        (summary, student) => {
            summary.total += 1;
            summary[student.status] += 1;
            return summary;
        },
        {
            total: 0,
            active: 0,
            flagged: 0,
            submitted: 0,
            disconnected: 0,
        },
    );

    return {
        exam: args.exam,
        stats,
        students: args.students.sort((left, right) => {
            const lastNameCompare = left.lastName.localeCompare(right.lastName);

            if (lastNameCompare !== 0) {
                return lastNameCompare;
            }

            return left.firstName.localeCompare(right.firstName);
        }),
    };
}

export function mapMonitoringExam(args: {
    examId: string;
    title: string;
    subject: string;
    scheduledDate: string | null;
    endDateTime: string | null;
    runtimeAccess?: MonitoringExam['runtimeAccess'];
}): MonitoringExam {
    return {
        id: args.examId,
        title: args.title,
        subject: args.subject,
        scheduledDate: args.scheduledDate,
        endDateTime: args.endDateTime,
        runtimeAccess: args.runtimeAccess,
    };
}

export function formatMonitoringLastActivity(value: string | null | undefined) {
    return getRelativeTimeLabel(toDate(value));
}

import type {
    TelemetryAggregationMetadata,
    TelemetryEventType,
    TelemetryIncidentStatus,
    TelemetryIncidentType,
    TelemetrySeverityReason,
} from '../../../../../schema/telemetry/telemetry-schema';
import type { ExamRuntimeAccess } from '../../../../exams/exam';

export type FlagType = TelemetryIncidentType;

export type Flag = {
    id: string;
    type: FlagType;
    rawEventType?: TelemetryEventType | null;
    timestamp: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    snapshotUrl?: string;
    evidenceUrl?: string | null;
    status?: TelemetryIncidentStatus | null;
    occurrenceCount?: number;
    severityReason?: TelemetrySeverityReason | null;
    persistenceTrigger?: TelemetryAggregationMetadata['trigger'] | null;
    matchingWindowSeconds?: number | null;
    wasSeverityForced?: boolean;
};

export type StudentSession = {
    id: string;
    studentRecordId?: string;
    attemptId: string;
    studentNo: string;
    firstName: string;
    lastName: string;
    status: 'active' | 'submitted' | 'flagged' | 'disconnected';
    progress: number;
    flags?: Flag[];
    incidentCount: number;
    openIncidentCount: number;
    latestIncidentType?: FlagType | null;
    lastActivity: string;
    lastActivityAt?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    timeSpentMinutes?: number | null;
    reconnectCount?: number;
    score?: number | null;
    totalScore?: number | null;
};

export type ExamData = {
    id: string;
    title: string;
    subject: string;
    scheduledDate?: string | null;
    endDateTime?: string | null;
    maxReconnectAttempts?: number;
    runtimeAccess?: ExamRuntimeAccess;
};

export type MonitoringOverview = {
    exam: ExamData;
    stats: MonitoringStatsProps['stats'];
    lobbyAdmissions: {
        waiting: number;
        approved: number;
        inAttempt: number;
    };
    students: StudentSession[];
};

export type MonitoringHeaderProps = {
    examId: string;
    examTitle: string;
    examSubject: string;
    runtimeAccess?: ExamRuntimeAccess;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    onLock?: () => void;
    onReopen?: () => void;
    onReset?: () => void;
    onClose?: () => void;
    isUpdatingAccess?: boolean;
};

export type MonitoringStatsProps = {
    stats: {
        total: number;
        active: number;
        flagged: number;
        submitted: number;
        disconnected?: number;
    };
    lobbyAdmissions?: {
        waiting: number;
        approved: number;
        inAttempt: number;
    };
};

export type StudentListProps = {
    students: StudentSession[];
    selectedId: string | null;
    onSelect: (student: StudentSession) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onFilterChange: (value: string) => void;
    page?: number;
    pageSize?: number;
    totalCount?: number;
    onPageChange?: (page: number) => void;
    maxReconnectAttempts?: number;
    overridingStudentId?: string | null;
    onOverrideReconnect?: (student: StudentSession) => void;
};

export type StudentCardProps = {
    student: StudentSession;
    isSelected: boolean;
    onClick: () => void;
    maxReconnectAttempts?: number;
    isOverridingReconnect?: boolean;
    onOverrideReconnect?: (student: StudentSession) => void;
};

import type {
    TelemetryIncidentStatus,
    TelemetryIncidentType,
} from '../../../../../schema/telemetry/telemetry-schema';
import type { ExamRuntimeAccess } from '../../../../exams/exam';

export type FlagType = TelemetryIncidentType;

export type Flag = {
    id: string;
    type: FlagType;
    timestamp: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    snapshotUrl?: string;
    evidenceUrl?: string | null;
    status?: TelemetryIncidentStatus | null;
};

export type StudentSession = {
    id: string;
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
    score?: number | null;
    totalScore?: number | null;
};

export type ExamData = {
    id: string;
    title: string;
    subject: string;
    scheduledDate?: string | null;
    endDateTime?: string | null;
    runtimeAccess?: ExamRuntimeAccess;
};

export type MonitoringOverview = {
    exam: ExamData;
    stats: MonitoringStatsProps['stats'];
    students: StudentSession[];
};

export type MonitoringHeaderProps = {
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
};

export type StudentCardProps = {
    student: StudentSession;
    isSelected: boolean;
    onClick: () => void;
};

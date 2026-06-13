import type { ExamDetail, ExamSummary } from '../exam.dto';
import type { ExamHistoryDetail, ExamHistorySummary } from '../../history/history.dto';
import { resolveExamStatus, resolveStudentExamStatus } from './resolve-exam-status';
import type { ExamRuntimeAccess } from '../../runtime-access/runtime-access.dto';
import type { TelemetryMediaPipeSandboxSchemaValues } from '@sentinel/shared';

export type RawExamRecord = {
    exam_id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    passing_score: number | null;
    status: string | null;
    class_group_id?: string | null;
    class_name?: string | null;
    subject_id: string | null;
    subject_title?: string | null;
    section_id?: string | null;
    assigned_section_ids?: string[] | null;
    assigned_section_names?: string[] | null;
    section_name: string | null;
    linked_section_name?: string | null;
    room_id?: string | null;
    room_name?: string | null;
    scheduled_date: Date | string | null;
    end_date_time: Date | string | null;
    published_at: Date | string | null;
    question_count: number | null;
    created_at: Date | string | null;
    updated_at: Date | string | null;
    institution_id?: string | null;
    attempt_id?: string | null;
    attempt_status?: string | null;
    attempt_completed_at?: Date | string | null;
    attempt_score?: number | null;
    attempt_total_score?: number | null;
    attempt_time_spent_minutes?: number | null;
    attempt_incident_count?: number | null;
    attempt_primary_incident_type?: string | null;
    attempt_answered_count?: number | null;
    students_count?: number | string | null;
    incident_count?: number | string | null;
    exam_category?: string | null;
};

function resolveMappedExamStatus(
    record: RawExamRecord,
    studentView: true,
): ExamHistorySummary['status'];
function resolveMappedExamStatus(record: RawExamRecord, studentView?: false): ExamSummary['status'];
function resolveMappedExamStatus(record: RawExamRecord, studentView = false) {
    if (studentView) {
        return resolveStudentExamStatus({
            status: record.status,
            scheduledDate: record.scheduled_date,
            endDateTime: record.end_date_time,
            durationMinutes: record.duration_minutes,
            attemptCompletedAt: record.attempt_completed_at,
            attemptStatus: record.attempt_status,
        });
    }

    return resolveExamStatus({
        status: record.status,
        scheduledDate: record.scheduled_date,
        endDateTime: record.end_date_time,
        durationMinutes: record.duration_minutes,
    });
}

function computePercentage(score?: number | null, totalScore?: number | null) {
    if (typeof score !== 'number' || typeof totalScore !== 'number' || totalScore <= 0) {
        return null;
    }

    return Math.round((score / totalScore) * 100);
}

function computeProgressPercentage(answeredCount?: number | null, totalQuestions?: number | null) {
    if (
        typeof answeredCount !== 'number' ||
        typeof totalQuestions !== 'number' ||
        totalQuestions <= 0
    ) {
        return 0;
    }

    return Math.round((answeredCount / totalQuestions) * 100);
}

function mapIncidentTypeToCheatingType(
    incidentType?: string | null,
    incidentCount?: number | null,
): ExamSummary['cheatingType'] {
    if ((incidentCount ?? 0) > 1) {
        return 'multiple';
    }

    switch (incidentType) {
        case 'GAZE':
        case 'FACE_NOT_VISIBLE':
        case 'MULTIPLE_FACES':
        case 'SUSPICIOUS_MOVEMENT':
            return 'gaze';
        case 'AUDIO_DETECTED':
            return 'audio';
        case 'TAB_SWITCH':
        case 'APP_BACKGROUNDING':
            return 'tab_switch';
        case 'SCREENSHOT':
            return 'screenshot';
        case 'SCREEN_RECORD':
            return 'screen_record';
        default:
            return null;
    }
}

function resolveHistoryResult(record: RawExamRecord): ExamHistorySummary['result'] {
    const percentage = computePercentage(record.attempt_score, record.attempt_total_score);

    if (percentage === null) {
        return null;
    }

    return percentage >= (record.passing_score ?? 0) ? 'passed' : 'failed';
}

function getAvailableAt(record: RawExamRecord) {
    return record.scheduled_date ?? record.published_at ?? null;
}

function getDueAt(record: RawExamRecord) {
    return record.end_date_time ?? record.scheduled_date ?? record.published_at ?? null;
}

function parseJsonArray(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return [];
        }
    }
    return [];
}

function buildSectionIds(record: RawExamRecord) {
    const assignedIds = parseJsonArray(record.assigned_section_ids);
    return Array.from(new Set([record.section_id, ...assignedIds].filter(Boolean))) as string[];
}

function buildSectionNames(record: RawExamRecord) {
    const assignedNames = parseJsonArray(record.assigned_section_names);
    return Array.from(new Set([record.section_name, ...assignedNames].filter(Boolean))) as string[];
}

export function mapExamSummaryResponse(
    record: RawExamRecord,
    options?: { studentView?: boolean; runtimeAccess?: ExamRuntimeAccess },
): ExamSummary {
    const studentView = options?.studentView ?? false;

    return {
        id: record.exam_id,
        title: record.title,
        description: record.description,
        durationMinutes: record.duration_minutes,
        passingScore: record.passing_score ?? 0,
        status: studentView
            ? resolveMappedExamStatus(record, true)
            : resolveMappedExamStatus(record, false),
        classroomId: record.class_group_id ?? null,
        classroomName: record.class_name ?? null,
        subjectId: record.subject_id,
        subjectTitle: record.subject_title ?? null,
        sectionId: record.section_id ?? null,
        sectionIds: buildSectionIds(record),
        sectionNames: buildSectionNames(record),
        sectionName: record.section_name ?? record.linked_section_name ?? null,
        roomId: record.room_id ?? null,
        roomName: record.room_name ?? null,
        scheduledDate: record.scheduled_date ?? null,
        endDateTime: record.end_date_time ?? null,
        publishedAt: record.published_at ?? null,
        questionCount: record.question_count ?? 0,
        createdAt: record.created_at ?? null,
        updatedAt: record.updated_at ?? null,
        attemptId: record.attempt_id ?? null,
        completedAt: record.attempt_completed_at ?? null,
        score: record.attempt_score != null ? Number(record.attempt_score) : null,
        totalScore: record.attempt_total_score != null ? Number(record.attempt_total_score) : null,
        percentage:
            record.attempt_status?.toUpperCase() === 'COMPLETED' ||
            record.attempt_completed_at != null
                ? computePercentage(record.attempt_score, record.attempt_total_score)
                : computeProgressPercentage(record.attempt_answered_count, record.question_count),
        timeSpentMinutes: record.attempt_time_spent_minutes ?? null,
        cheated: (record.attempt_incident_count ?? 0) > 0,
        cheatingType:
            mapIncidentTypeToCheatingType(
                record.attempt_primary_incident_type,
                record.attempt_incident_count,
            ) ?? null,
        incidentCount: studentView
            ? (record.attempt_incident_count ?? 0)
            : record.incident_count != null
              ? Number(record.incident_count)
              : 0,
        studentsCount: studentView
            ? 0
            : record.students_count != null
              ? Number(record.students_count)
              : 0,
        runtimeAccess: options?.runtimeAccess,
        examCategory: (record.exam_category as any) ?? null,
    };
}

export function mapExamHistorySummaryResponse(record: RawExamRecord): ExamHistorySummary {
    return {
        id: record.attempt_id ?? record.exam_id,
        attemptId: record.attempt_id ?? null,
        examId: record.exam_id,
        examTitle: record.title,
        subject: record.subject_title ?? 'Untitled Subject',
        sectionIds: buildSectionIds(record),
        sectionNames: buildSectionNames(record),
        sectionName: record.section_name ?? record.linked_section_name ?? null,
        status: resolveMappedExamStatus(record, true),
        result: resolveHistoryResult(record),
        availableAt: getAvailableAt(record),
        dueAt: getDueAt(record),
        completedAt: record.attempt_completed_at ?? null,
        score: record.attempt_score != null ? Number(record.attempt_score) : null,
        totalScore: record.attempt_total_score != null ? Number(record.attempt_total_score) : null,
        percentage: computePercentage(record.attempt_score, record.attempt_total_score),
        timeSpent: record.attempt_time_spent_minutes ?? null,
        cheated: (record.attempt_incident_count ?? 0) > 0,
        cheatingType:
            mapIncidentTypeToCheatingType(
                record.attempt_primary_incident_type,
                record.attempt_incident_count,
            ) ?? null,
        incidentCount: record.attempt_incident_count ?? 0,
    };
}

export function mapExamHistoryDetailResponse(record: RawExamRecord): ExamHistoryDetail {
    return {
        ...mapExamHistorySummaryResponse(record),
        durationMinutes: record.duration_minutes,
        passingScore: record.passing_score ?? 0,
        roomName: record.room_name ?? null,
    };
}

export function mapExamDetailResponse(args: {
    exam: RawExamRecord;
    settings: ExamDetail['settings'];
    configuration: ExamDetail['configuration'];
    mediaPipeSandbox: TelemetryMediaPipeSandboxSchemaValues;
    questionSections: ExamDetail['questionSections'];
    questions: ExamDetail['questions'];
    studentView?: boolean;
    runtimeAccess?: ExamRuntimeAccess;
}): ExamDetail {
    return {
        ...mapExamSummaryResponse(args.exam, {
            studentView: args.studentView,
            runtimeAccess: args.runtimeAccess,
        }),
        settings: args.settings,
        configuration: args.configuration,
        mediaPipeSandbox: args.mediaPipeSandbox,
        questionSections: args.questionSections,
        questions: args.questions,
    };
}

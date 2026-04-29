import { resolveExamStatus } from '@sentinel/shared';
import type {
    ExamRuntimeAccess,
    Flag,
    StudentSession,
    ExamReport,
    ProctorExam,
} from '@sentinel/shared/types';
import type {
    ApiMonitoringIncident,
    ApiMonitoringStudentSummary,
    ApiMonitoringStudentDetail,
    ApiExamReportActionItem,
    ApiExamReportStudentSummary,
    ApiExamSummary,
    ApiExamDetail,
} from './types';

export function normalizeDateTime(value?: string | null) {
    return value ?? undefined;
}

export function formatRelativeTime(value?: string | null) {
    if (!value) {
        return 'No recent activity';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'No recent activity';
    }

    const diffMs = Date.now() - date.getTime();
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

export function mapMonitoringFlag(flag: ApiMonitoringIncident): Flag {
    return {
        id: flag.id,
        type: flag.type,
        rawEventType: flag.rawEventType ?? null,
        timestamp: flag.timestamp,
        description: flag.description,
        severity: flag.severity,
        snapshotUrl: flag.snapshotUrl ?? undefined,
        evidenceUrl: flag.evidenceUrl ?? null,
        status: flag.status ?? null,
        occurrenceCount: flag.occurrenceCount,
        severityReason: flag.severityReason ?? null,
        persistenceTrigger: flag.persistenceTrigger ?? null,
        matchingWindowSeconds: flag.matchingWindowSeconds ?? null,
        wasSeverityForced: flag.wasSeverityForced ?? false,
    };
}

export function mapExamRuntimeAccess(
    runtimeAccess?: ExamRuntimeAccess | null,
): ExamRuntimeAccess | undefined {
    if (!runtimeAccess) {
        return undefined;
    }

    const normalizeRuntimeDate = (value?: string | Date | null) =>
        typeof value === 'string' ? (normalizeDateTime(value) ?? null) : (value ?? null);

    return {
        ...runtimeAccess,
        startsAt: normalizeRuntimeDate(runtimeAccess.startsAt),
        endsAt: normalizeRuntimeDate(runtimeAccess.endsAt),
        reopenedUntil: normalizeRuntimeDate(runtimeAccess.reopenedUntil),
    };
}

export function mapMonitoringStudent(
    student: ApiMonitoringStudentSummary | ApiMonitoringStudentDetail,
): StudentSession {
    return {
        id: student.id,
        studentRecordId: student.studentRecordId,
        attemptId: student.attemptId,
        studentNo: student.studentNo,
        firstName: student.firstName,
        lastName: student.lastName,
        status: student.status,
        progress: student.progress,
        flags: 'flags' in student ? student.flags.map(mapMonitoringFlag) : [],
        incidentCount: student.incidentCount,
        openIncidentCount: student.openIncidentCount,
        latestIncidentType: student.latestIncidentType ?? null,
        lastActivity: formatRelativeTime(student.lastActivityAt),
        lastActivityAt: student.lastActivityAt ?? null,
        startedAt: student.startedAt ?? null,
        completedAt: student.completedAt ?? null,
        timeSpentMinutes: student.timeSpentMinutes ?? null,
        reconnectCount: student.reconnectCount ?? 0,
        score: student.score ?? null,
        totalScore: student.totalScore ?? null,
    };
}

export function mapExamReportActionItem(
    item: ApiExamReportActionItem,
): ExamReport['actionItems']['review'][number] {
    return {
        id: item.id,
        studentId: item.studentId,
        attemptId: item.attemptId ?? null,
        studentNo: item.studentNo,
        firstName: item.firstName,
        lastName: item.lastName,
        reason: item.reason,
    };
}

export function mapExamReportStudent(
    student: ApiExamReportStudentSummary,
): ExamReport['students'][number] {
    return {
        id: student.id,
        studentId: student.studentId,
        attemptId: student.attemptId ?? null,
        studentNo: student.studentNo,
        firstName: student.firstName,
        lastName: student.lastName,
        sectionId: student.sectionId ?? null,
        sectionName: student.sectionName ?? null,
        status: student.status,
        startedAt: student.startedAt ?? null,
        completedAt: student.completedAt ?? null,
        score: student.score ?? null,
        totalScore: student.totalScore ?? null,
        percentage: student.percentage ?? null,
        timeSpentMinutes: student.timeSpentMinutes ?? null,
        incidentCount: student.incidentCount,
        openIncidentCount: student.openIncidentCount,
        primaryIncidentType: student.primaryIncidentType ?? null,
        highestIncidentSeverity: student.highestIncidentSeverity ?? null,
        incidentOutcomes: student.incidentOutcomes,
        submissionType: (student as any).submissionType ?? null,
        attemptKind: student.attemptKind ?? null,
        attemptCount: student.attemptCount,
        isFlagged: student.isFlagged,
        needsReview: student.needsReview,
        needsMakeup: student.needsMakeup,
        needsRetake: student.needsRetake,
    };
}

export function mapExam(apiExam: ApiExamSummary | ApiExamDetail): ProctorExam {
    return {
        id: apiExam.id,
        title: apiExam.title,
        description: apiExam.description ?? '',
        duration: apiExam.durationMinutes,
        passingScore: apiExam.passingScore,
        status: resolveExamStatus({
            status: apiExam.status,
            scheduledDate: apiExam.scheduledDate,
            endDateTime: apiExam.endDateTime,
            durationMinutes: apiExam.durationMinutes,
        }),
        settings: 'settings' in apiExam ? apiExam.settings : undefined,
        configuration: 'configuration' in apiExam ? apiExam.configuration : undefined,
        questions:
            'questions' in apiExam
                ? apiExam.questions.map((question) => ({
                      id: question.id,
                      examId: question.examId,
                      sectionId: question.sectionId ?? undefined,
                      sourceQuestionBankQuestionId:
                          question.sourceQuestionBankQuestionId ?? undefined,
                      sourceCollectionId: question.sourceCollectionId ?? undefined,
                      sourceOrigin: question.sourceOrigin ?? undefined,
                      sourceFileName: question.sourceFileName ?? null,
                      sourcePageNumber: question.sourcePageNumber ?? null,
                      sourceEvidence: question.sourceEvidence ?? null,
                      type: question.type,
                      points: question.points,
                      orderIndex: question.orderIndex,
                      content: question.content,
                      tags: question.tags ?? [],
                  }))
                : undefined,
        questionSections:
            'questionSections' in apiExam
                ? apiExam.questionSections.map((section) => ({
                      ...section,
                      isCollapsed: false,
                  }))
                : undefined,
        createdAt: normalizeDateTime(apiExam.createdAt) ?? new Date().toISOString(),
        updatedAt: normalizeDateTime(apiExam.updatedAt) ?? new Date().toISOString(),
        publishedAt: normalizeDateTime(apiExam.publishedAt),
        classroomId: apiExam.classroomId ?? undefined,
        classroomName: apiExam.classroomName ?? undefined,
        subject: apiExam.subjectTitle ?? 'Untitled Subject',
        subjectId: apiExam.subjectId ?? undefined,
        section: apiExam.sectionName ?? undefined,
        sectionIds: apiExam.assigned_section_ids ?? [],
        room: apiExam.roomName ?? undefined,
        roomId: apiExam.roomId ?? undefined,
        scheduledDate: normalizeDateTime(apiExam.scheduledDate),
        endDateTime: normalizeDateTime(apiExam.endDateTime),
        questionCount: apiExam.questionCount,
        studentsCount: 0,
        runtimeAccess: mapExamRuntimeAccess(apiExam.runtimeAccess),
        mediaPipeSandbox: 'mediaPipeSandbox' in apiExam ? apiExam.mediaPipeSandbox : undefined,
    };
}

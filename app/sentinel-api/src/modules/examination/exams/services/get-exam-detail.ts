import { type DbClient } from '@sentinel/db';
import { getExamConfigurationState } from '../../configuration/configuration.service';
import type { ExamDetail } from '../exam.dto';
import { getExamByIdData } from '../data/get-exam-by-id';
import { getExamQuestionsData } from '../data/get-exam-questions';
import { getExamSectionsData } from '../data/get-exam-sections';
import { mapExamDetailResponse } from './map-exam-response';
import { requireExamRecord } from './require-exam-record';
import { RuntimeAccessService } from '../../runtime-access/runtime-access.service';
import { AccessGatekeeperService } from '../../access/services/access-gatekeeper.service';
import { buildStudentOverrideRuntimeAccess } from '../../student-overrides/student-overrides.service';
import type { ExamRuntimeAccess } from '../../runtime-access/runtime-access.dto';

export async function getExamDetail(
    dbClient: DbClient,
    id: string,
    institutionId?: string,
    studentUserId?: string,
): Promise<ExamDetail> {
    const [exam, sections, questions, configurationState] = await Promise.all([
        getExamByIdData({ dbClient, id, institutionId, studentUserId }),
        getExamSectionsData({ dbClient, examId: id }),
        getExamQuestionsData({ dbClient, examId: id }),
        getExamConfigurationState(dbClient, id),
    ]);

    const resolvedExam = requireExamRecord(exam);
    const hasCompletedAttempt = resolvedExam.attempt_status?.toUpperCase() === 'COMPLETED';
    let runtimeAccess: ExamRuntimeAccess;

    if (studentUserId) {
        const accessCheck = await AccessGatekeeperService.verifyStudentExamEligibility(
            dbClient,
            studentUserId,
            id,
        );

        runtimeAccess = accessCheck.runtimeAccess;

        if (hasCompletedAttempt) {
            runtimeAccess = accessCheck.accessOverride
                ? buildStudentOverrideRuntimeAccess({
                      accessOverride: accessCheck.accessOverride,
                      runtimeAccess: accessCheck.runtimeAccess,
                  })
                : {
                      ...accessCheck.runtimeAccess,
                      state: 'closed',
                      reasonCode: 'CLOSED',
                      message: 'This exam has already been turned in.',
                      canStart: false,
                      canResume: false,
                      hasActiveAttempt: false,
                  };
        }
    } else {
        runtimeAccess = await RuntimeAccessService.resolveExamRuntimeAccess({
            dbClient,
            examId: id,
            scheduledDate: resolvedExam.scheduled_date,
            endDateTime: resolvedExam.end_date_time,
            durationMinutes: resolvedExam.duration_minutes,
            hasActiveAttempt: resolvedExam.attempt_status?.toUpperCase() === 'IN_PROGRESS',
        });
    }

    return mapExamDetailResponse({
        exam: resolvedExam,
        settings: configurationState.settings,
        configuration: configurationState.configuration,
        questionSections: sections.map((section) => ({
            id: section.exam_section_id,
            title: section.title,
            orderIndex: section.order_index,
        })),
        questions: questions.map((question) => ({
            id: question.question_id,
            examId: question.exam_id,
            sectionId: question.exam_section_id,
            sourceQuestionBankQuestionId: question.source_question_bank_question_id,
            sourceCollectionId: question.source_collection_id,
            sourceOrigin: question.source_origin === 'AI_PDF' ? 'AI_PDF' : undefined,
            sourceFileName: question.source_file_name ?? null,
            sourcePageNumber: question.source_page_number ?? null,
            sourceEvidence: question.source_evidence ?? null,
            type: question.question_type as ExamDetail['questions'][number]['type'],
            points: question.points,
            orderIndex: question.order_index,
            content: question.content as ExamDetail['questions'][number]['content'],
        })),
        studentView: Boolean(studentUserId),
        runtimeAccess,
    });
}

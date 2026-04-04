import { type DbClient } from '@sentinel/db';
import { getExamConfigurationState } from '../../configuration/configuration.service';
import type { ExamDetail } from '../exam.dto';
import { getExamByIdData } from '../data/get-exam-by-id';
import { getExamQuestionsData } from '../data/get-exam-questions';
import { getExamSectionsData } from '../data/get-exam-sections';
import { mapExamDetailResponse } from './map-exam-response';
import { requireExamRecord } from './require-exam-record';

export async function getExamDetail(
    dbClient: DbClient,
    id: string,
    institutionId?: string,
): Promise<ExamDetail> {
    const [exam, sections, questions, configurationState] = await Promise.all([
        getExamByIdData({ dbClient, id, institutionId }),
        getExamSectionsData({ dbClient, examId: id }),
        getExamQuestionsData({ dbClient, examId: id }),
        getExamConfigurationState(dbClient, id),
    ]);

    const resolvedExam = requireExamRecord(exam);

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
            type: question.question_type as ExamDetail['questions'][number]['type'],
            points: question.points,
            orderIndex: question.order_index,
            content: question.content as ExamDetail['questions'][number]['content'],
        })),
    });
}

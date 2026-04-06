import { type DbClient } from '@sentinel/db';
import {
    hasExamConfigurationChanges,
    saveExamConfiguration,
} from '@/modules/examination/configuration/configuration.service';
import type { UpdateExamBody } from '../exam.dto';
import { getExamByIdData } from '../data/get-exam-by-id';
import { getExamQuestionsData } from '../data/get-exam-questions';
import { getExamSectionsData } from '../data/get-exam-sections';
import { replaceExamQuestionsData } from '../data/replace-exam-questions';
import { replaceExamSectionsData } from '../data/replace-exam-sections';
import { updateExamData } from '../data/update-exam';
import { getExamColumnSupport } from '../helper/exam-schema-compat';
import { assertExamScheduleWindow } from './assert-exam-schedule-window';
import { buildUpdateExamValues } from './build-exam-write-values';
import { executeExamTransaction } from './execute-exam-transaction';
import { getExamDetail } from './get-exam-detail';
import {
    mapExamStructureQuestionInput,
    normalizeExamStructureInput,
} from './normalize-exam-structure-input';
import { requireExamRecord } from './require-exam-record';

async function syncExamStructure(args: {
    dbClient: DbClient;
    examId: string;
    body: UpdateExamBody;
    institutionId?: string;
    userId: string;
}) {
    const { dbClient, examId, body, institutionId, userId } = args;

    const currentSections = body.questionSections
        ? []
        : await getExamSectionsData({
              dbClient,
              examId,
          });
    const currentQuestions = body.questions
        ? []
        : await getExamQuestionsData({
              dbClient,
              examId,
          });
    const structure = normalizeExamStructureInput({
        examId,
        questionSections:
            body.questionSections ??
            currentSections.map((section) => ({
                id: section.exam_section_id,
                title: section.title,
                orderIndex: section.order_index,
            })),
        questions:
            body.questions ??
            currentQuestions.map(mapExamStructureQuestionInput),
    });

    await replaceExamSectionsData({
        dbClient,
        examId,
        sections: structure.normalizedSections,
    });

    await replaceExamQuestionsData({
        dbClient,
        examId,
        questions: structure.normalizedQuestions,
    });

    await updateExamData({
        dbClient,
        id: examId,
        institutionId,
        values: {
            question_count: structure.normalizedQuestions.length,
            updated_at: new Date(),
            updated_by: userId,
        },
    });
}

export async function updateExam(
    dbClient: DbClient,
    id: string,
    body: UpdateExamBody,
    institutionId: string | undefined,
    userId: string,
) {
    const current = requireExamRecord(
        await getExamByIdData({
            dbClient,
            id,
            institutionId,
        }),
    );

    const sectionColumnSupport = await getExamColumnSupport(dbClient);

    assertExamScheduleWindow({
        startDateTime: body.startDateTime ?? current.scheduled_date,
        endDateTime: body.endDateTime ?? current.end_date_time,
    });

    await executeExamTransaction(async (trx) => {
        requireExamRecord(
            await updateExamData({
                dbClient: trx,
                id,
                institutionId,
                values: buildUpdateExamValues({
                    body,
                    institutionId,
                    userId,
                    sectionColumnSupport,
                }),
            }),
        );

        if (hasExamConfigurationChanges(body)) {
            await saveExamConfiguration({
                dbClient: trx,
                examId: id,
                payload: body,
            });
        }

        if (body.questionSections || body.questions) {
            await syncExamStructure({
                dbClient: trx,
                examId: id,
                body,
                institutionId,
                userId,
            });
        }
    });

    return await getExamDetail(
        dbClient,
        id,
        institutionId ?? body.institutionId ?? undefined,
    );
}

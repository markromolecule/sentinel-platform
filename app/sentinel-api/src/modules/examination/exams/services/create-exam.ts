import { type DbClient } from '@sentinel/db';
import { saveExamConfiguration } from '../../configuration/configuration.service';
import type { CreateExamBody } from '../exam.dto';
import { createExamData } from '../data/create-exam';
import { replaceExamQuestionsData } from '../data/replace-exam-questions';
import { replaceExamSectionsData } from '../data/replace-exam-sections';
import { replaceExamAssignedSectionsData } from '../data/replace-exam-assigned-sections';
import { updateExamData } from '../data/update-exam';
import { getExamColumnSupport, getExamQuestionColumnSupport } from '../helper/exam-schema-compat';
import { assertRoomBelongsToInstitution } from './assert-room-belongs-to-institution';
import { assertExamScheduleWindow } from './assert-exam-schedule-window';
import { buildCreateExamValues } from './build-exam-write-values';
import { executeExamTransaction } from './execute-exam-transaction';
import { getExamDetail } from './get-exam-detail';
import { normalizeExamStructureInput } from './normalize-exam-structure-input';

export async function createExam(
    dbClient: DbClient,
    body: CreateExamBody,
    institutionId: string | undefined,
    userId: string,
) {
    assertExamScheduleWindow({
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
    });

    const [sectionColumnSupport, questionColumnSupport] = await Promise.all([
        getExamColumnSupport(dbClient),
        getExamQuestionColumnSupport(dbClient),
    ]);
    const targetInstitutionId = institutionId ?? body.institutionId ?? undefined;

    await assertRoomBelongsToInstitution({
        dbClient,
        roomId: body.roomId,
        institutionId: targetInstitutionId,
    });

    const createdExam = await executeExamTransaction(async (trx) => {
        const exam = await createExamData({
            dbClient: trx,
            values: buildCreateExamValues({
                body,
                institutionId: targetInstitutionId,
                userId,
                sectionColumnSupport,
            }),
        });

        await saveExamConfiguration({
            dbClient: trx,
            examId: exam.exam_id,
            payload: body,
        });

        const structure = normalizeExamStructureInput({
            examId: exam.exam_id,
            questionSections: body.questionSections,
            questions: body.questions,
        });

        // Add this: handle assigned sections
        if (body.sectionIds && body.sectionIds.length > 0) {
            await replaceExamAssignedSectionsData({
                dbClient: trx,
                examId: exam.exam_id,
                sectionIds: body.sectionIds,
            });
        }
        const normalizedQuestions = questionColumnSupport.hasSourceCollectionId
            ? structure.normalizedQuestions
            : structure.normalizedQuestions.map(
                  ({ source_collection_id: _sourceCollectionId, ...question }) => question,
              );

        await replaceExamSectionsData({
            dbClient: trx,
            examId: exam.exam_id,
            sections: structure.normalizedSections,
        });

        await replaceExamQuestionsData({
            dbClient: trx,
            examId: exam.exam_id,
            questions: normalizedQuestions,
        });

        await updateExamData({
            dbClient: trx,
            id: exam.exam_id,
            institutionId: targetInstitutionId,
            values: {
                question_count: normalizedQuestions.length,
                updated_at: new Date(),
                updated_by: userId,
            },
        });

        return exam;
    });

    return await getExamDetail(dbClient, createdExam.exam_id, targetInstitutionId);
}

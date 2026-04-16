import { type DbClient } from '@sentinel/db';
import {
    hasExamConfigurationChanges,
    saveExamConfiguration,
} from '../../configuration/configuration.service';
import { assertExamConfigurationMutable } from '../../configuration/services/assert-exam-configuration-mutable';
import type { UpdateExamBody } from '../exam.dto';
import { getExamByIdData } from '../data/get-exam-by-id';
import { getExamQuestionsData } from '../data/get-exam-questions';
import { getExamSectionsData } from '../data/get-exam-sections';
import { replaceExamQuestionsData } from '../data/replace-exam-questions';
import { replaceExamSectionsData } from '../data/replace-exam-sections';
import { updateExamData } from '../data/update-exam';
import { getExamColumnSupport, getExamQuestionColumnSupport } from '../helper/exam-schema-compat';
import { assertRoomBelongsToInstitution } from './assert-room-belongs-to-institution';
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
    hasSourceCollectionId: boolean;
}) {
    const { dbClient, examId, body, institutionId, userId, hasSourceCollectionId } = args;

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
        questions: body.questions ?? currentQuestions.map(mapExamStructureQuestionInput),
    });
    const normalizedQuestions = hasSourceCollectionId
        ? structure.normalizedQuestions
        : structure.normalizedQuestions.map(
              ({ source_collection_id: _sourceCollectionId, ...question }) => question,
          );

    await replaceExamSectionsData({
        dbClient,
        examId,
        sections: structure.normalizedSections,
    });

    await replaceExamQuestionsData({
        dbClient,
        examId,
        questions: normalizedQuestions,
    });

    await updateExamData({
        dbClient,
        id: examId,
        institutionId,
        values: {
            question_count: normalizedQuestions.length,
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
    canBypassLock = false,
) {
    const current = requireExamRecord(
        await getExamByIdData({
            dbClient,
            id,
            institutionId,
        }),
    );
    const targetInstitutionId =
        institutionId ?? body.institutionId ?? current.institution_id ?? undefined;

    const [sectionColumnSupport, questionColumnSupport] = await Promise.all([
        getExamColumnSupport(dbClient),
        getExamQuestionColumnSupport(dbClient),
    ]);

    assertExamScheduleWindow({
        startDateTime: body.startDateTime ?? current.scheduled_date,
        endDateTime: body.endDateTime ?? current.end_date_time,
    });

    await assertRoomBelongsToInstitution({
        dbClient,
        roomId: body.roomId,
        institutionId: targetInstitutionId,
    });

    await executeExamTransaction(async (trx) => {
        const updateValues = buildUpdateExamValues({
            body,
            institutionId: targetInstitutionId,
            userId,
            sectionColumnSupport,
        });

        if (body.status?.toLowerCase() === 'draft') {
            updateValues.published_at = null;
        }
        

        requireExamRecord(
            await updateExamData({
                dbClient: trx,
                id,
                institutionId: targetInstitutionId,
                values: updateValues,
            }),
        );

        if (hasExamConfigurationChanges(body)) {
            assertExamConfigurationMutable(current, canBypassLock);
            await saveExamConfiguration({
                dbClient: trx,
                examId: id,
                payload: body,
            });
        }

        if (body.questionSections || body.questions) {
            assertExamConfigurationMutable(current, canBypassLock);
            await syncExamStructure({
                dbClient: trx,
                examId: id,
                body,
                institutionId: targetInstitutionId,
                userId,
                hasSourceCollectionId: questionColumnSupport.hasSourceCollectionId,
            });
        }
    });

    return await getExamDetail(dbClient, id, targetInstitutionId);
}

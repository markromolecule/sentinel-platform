import { type DbClient } from '@sentinel/db';
import { saveExamConfiguration } from '../../configuration/configuration.service';
import type { CreateExamBody } from '../exam.dto';
import { createExamData } from '../data/create-exam';
import { LogsService } from '../../../general/logs/logs.service';

import { replaceExamQuestionsData } from '../data/replace-exam-questions';
import { replaceExamSectionsData } from '../data/replace-exam-sections';
import { replaceExamAssignedSectionsData } from '../data/replace-exam-assigned-sections';
import { updateExamData } from '../data/update-exam';
import { getExamColumnSupport, getExamQuestionColumnSupport } from '../helper/exam-schema-compat';
import { assertExamRoomAvailability } from './assert-exam-room-availability';
import { assertRoomBelongsToInstitution } from './assert-room-belongs-to-institution';
import { assertExamScheduleWindow } from './assert-exam-schedule-window';
import { buildCreateExamValues } from './build-exam-write-values';
import { executeExamTransaction } from './execute-exam-transaction';
import { getExamDetail } from './get-exam-detail';
import { normalizeExamStructureInput } from './normalize-exam-structure-input';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';
import {
    resolveInstructorExamAssignmentTargets,
    resolveInstructorLegacyExamAssignment,
} from './resolve-classroom-assignment';

export async function createExam(
    dbClient: DbClient,
    body: CreateExamBody,
    institutionId: string | undefined,
    userId: string,
    role?: string,
) {
    assertExamScheduleWindow({
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
    });

    const [sectionColumnSupport, questionColumnSupport] = await Promise.all([
        getExamColumnSupport(dbClient),
        getExamQuestionColumnSupport(dbClient),
    ]);
    const assignmentInstitutionId = institutionId ?? body.institutionId ?? undefined;
    const hasSectionTargets = Boolean(body.sectionId || (body.sectionIds && body.sectionIds.length > 0));
    const assignmentTargets = body.classroomId
        ? await resolveInstructorExamAssignmentTargets({
              dbClient,
              classroomId: body.classroomId,
              userId,
              institutionId: assignmentInstitutionId,
              sectionIds: body.sectionIds,
              role,
          })
        : (body.subjectId && !hasSectionTargets)
          ? {
                classroomAssignment: {
                    classGroupId: null as any,
                    className: null,
                    institutionId: assignmentInstitutionId ?? null,
                    subjectId: body.subjectId,
                    subjectTitle: null,
                    sectionId: null,
                    sectionName: null,
                },
                assignedSectionIds: [],
            }
          : {
                classroomAssignment: await resolveInstructorLegacyExamAssignment({
                    dbClient,
                    userId,
                    institutionId: assignmentInstitutionId,
                    subjectId: body.subjectId,
                    sectionId: body.sectionId,
                    sectionIds: body.sectionIds,
                    role,
                }),
                assignedSectionIds: [],
            };
    const { classroomAssignment, assignedSectionIds } = assignmentTargets;
    const targetInstitutionId =
        institutionId ?? body.institutionId ?? classroomAssignment.institutionId ?? undefined;

    await assertRoomBelongsToInstitution({
        dbClient,
        roomId: body.roomId,
        institutionId: targetInstitutionId,
    });

    await assertExamRoomAvailability({
        dbClient,
        institutionId: targetInstitutionId,
        roomId: body.roomId,
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
    });

    const createdExam = await executeExamTransaction(async (trx) => {
        const exam = await createExamData({
            dbClient: trx,
            values: buildCreateExamValues({
                body,
                institutionId: targetInstitutionId,
                userId,
                sectionColumnSupport,
                classroomAssignment,
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

        if (assignedSectionIds.length > 0) {
            await replaceExamAssignedSectionsData({
                dbClient: trx,
                examId: exam.exam_id,
                sectionIds: assignedSectionIds,
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

        if (body.roomId) {
            await recalculateRoomStatus(trx, body.roomId);
        }

        return exam;
    });

    // Real-time Audit Logging integration
    if (createdExam && targetInstitutionId) {
        try {
            await LogsService.createLog(dbClient, {
                userId,
                action: 'exam.create',
                resourceType: 'exam',
                resourceId: createdExam.exam_id,
                activeInstitutionId: targetInstitutionId,
                details: {
                    title: body.title,
                    questions: body.questions?.length || 0,
                    duration: body.durationMinutes,
                },
            });
        } catch (logErr) {
            console.error('Failed to log exam.create event:', logErr);
        }
    }

    return await getExamDetail(dbClient, createdExam.exam_id, targetInstitutionId);
}

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
import { assertExamRoomAvailability } from './assert-exam-room-availability.service';
import { assertRoomBelongsToInstitution } from './assert-room-belongs-to-institution.service';
import { assertExamScheduleWindow } from './assert-exam-schedule-window.service';
import { buildCreateExamValues } from './build-exam-write-values.service';
import { executeExamTransaction } from './execute-exam-transaction.service';
import { getExamDetail } from './get-exam-detail.service';
import { normalizeExamStructureInput } from './normalize-exam-structure-input.service';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';
import {
    resolveInstructorExamAssignmentTargets,
    resolveInstructorLegacyExamAssignment,
    buildExamSectionAssignmentInputs,
} from './resolve-classroom-assignment.service';
import { createExamSectionAssignmentsBatch } from '../../section-assignments/data/create-exam-section-assignments-batch';
import { syncExamAssignmentSummary } from '../../section-assignments/data/sync-exam-assignment-summary';

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
    const hasSectionTargets = Boolean(
        body.sectionId || (body.sectionIds && body.sectionIds.length > 0),
    );
    let assignmentTargets: any;
    if (body.classroomId) {
        assignmentTargets = await resolveInstructorExamAssignmentTargets({
            dbClient,
            classroomId: body.classroomId,
            userId,
            institutionId: assignmentInstitutionId,
            sectionIds: body.sectionIds,
            role,
        });
    } else if (body.subjectId && !hasSectionTargets) {
        assignmentTargets = {
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
            resolvedClassrooms: [],
        };
    } else {
        const classroomAssignment = await resolveInstructorLegacyExamAssignment({
            dbClient,
            userId,
            institutionId: assignmentInstitutionId,
            subjectId: body.subjectId,
            sectionId: body.sectionId,
            sectionIds: body.sectionIds,
            role,
        });
        assignmentTargets = {
            classroomAssignment,
            assignedSectionIds: [],
            resolvedClassrooms: classroomAssignment.classGroupId ? [classroomAssignment] : [],
        };
    }
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

        const normalizedAssignments = buildExamSectionAssignmentInputs({
            targets: assignmentTargets,
            roomId: body.roomId,
            startDateTime: body.startDateTime,
            instructorId: body.instructorId,
            instructorIds: body.instructorIds,
        });

        if (normalizedAssignments.length > 0) {
            await createExamSectionAssignmentsBatch({
                dbClient: trx,
                examId: exam.exam_id,
                assignments: normalizedAssignments,
            });
            await syncExamAssignmentSummary({
                dbClient: trx,
                examId: exam.exam_id,
            });
        }

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

        const roomIdsToRecalculate = Array.from(
            new Set(
                [body.roomId, ...normalizedAssignments.map((a) => a.roomId)].filter(
                    (id): id is string => Boolean(id),
                ),
            ),
        );
        for (const rid of roomIdsToRecalculate) {
            await recalculateRoomStatus(trx, rid);
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

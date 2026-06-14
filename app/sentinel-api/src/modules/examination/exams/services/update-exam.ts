import { type DbClient } from '@sentinel/db';
import {
    hasExamConfigurationChanges,
    saveExamConfiguration,
} from '../../configuration/configuration.service';
import { assertExamConfigurationMutable } from '../../configuration/services/assert-exam-configuration-mutable';
import { LogsService } from '../../../general/logs/logs.service';

import type { UpdateExamBody } from '../exam.dto';
import { getExamByIdData } from '../data/get-exam-by-id';
import { getExamQuestionsData } from '../data/get-exam-questions';
import { getExamSectionsData } from '../data/get-exam-sections';
import { replaceExamQuestionsData } from '../data/replace-exam-questions';
import { replaceExamSectionsData } from '../data/replace-exam-sections';
import { replaceExamAssignedSectionsData } from '../data/replace-exam-assigned-sections';
import { updateExamData } from '../data/update-exam';
import { getExamColumnSupport, getExamQuestionColumnSupport } from '../helper/exam-schema-compat';
import { assertExamRoomAvailability } from './assert-exam-room-availability';
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
import { resolveInstructorExamAssignmentTargets } from './resolve-classroom-assignment';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';

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
                description: section.description,
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

function parseDateTime(value: string | Date | null | undefined) {
    if (value === null || value === undefined) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

function hasDateTimeChanged(
    nextValue: string | Date | undefined,
    currentValue: string | Date | null,
) {
    if (nextValue === undefined) {
        return false;
    }

    return parseDateTime(nextValue)?.getTime() !== parseDateTime(currentValue)?.getTime();
}

export async function updateExam(
    dbClient: DbClient,
    id: string,
    body: UpdateExamBody,
    institutionId: string | undefined,
    userId: string,
    canBypassLock = false,
    role?: string,
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
    const assignmentTargets =
        body.classroomId === undefined
            ? undefined
            : body.classroomId === null
              ? undefined
              : await resolveInstructorExamAssignmentTargets({
                    dbClient,
                    classroomId: body.classroomId,
                    userId,
                    institutionId: targetInstitutionId,
                    sectionIds: body.sectionIds ?? undefined,
                    role,
                });
    const classroomAssignment = assignmentTargets?.classroomAssignment;

    assertExamScheduleWindow({
        startDateTime: body.startDateTime ?? current.scheduled_date,
        endDateTime: body.endDateTime ?? current.end_date_time,
    });

    const nextRoomId = body.roomId === undefined ? (current.room_id ?? null) : body.roomId;
    const nextStartDateTime = body.startDateTime ?? current.scheduled_date;
    const nextEndDateTime = body.endDateTime ?? current.end_date_time;
    const shouldRecheckRoomAvailability =
        nextRoomId !== null &&
        (body.roomId !== undefined ||
            body.institutionId !== undefined ||
            hasDateTimeChanged(body.startDateTime, current.scheduled_date) ||
            hasDateTimeChanged(body.endDateTime, current.end_date_time));

    await assertRoomBelongsToInstitution({
        dbClient,
        roomId: nextRoomId,
        institutionId: targetInstitutionId,
    });

    if (shouldRecheckRoomAvailability) {
        await assertExamRoomAvailability({
            dbClient,
            institutionId: targetInstitutionId,
            roomId: nextRoomId,
            startDateTime: nextStartDateTime,
            endDateTime: nextEndDateTime,
            excludeExamId: id,
        });
    }

    await executeExamTransaction(async (trx) => {
        const updateValues = buildUpdateExamValues({
            body,
            institutionId: targetInstitutionId,
            userId,
            sectionColumnSupport,
            classroomAssignment,
        });

        if (body.status) {
            const nextStatus = body.status.toLowerCase();
            if (nextStatus === 'published') {
                updateValues.published_at = new Date();
                updateValues.published_by = userId;
            } else if (nextStatus === 'draft') {
                updateValues.published_at = null;
                updateValues.published_by = null;
            }
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

        if (assignmentTargets) {
            await replaceExamAssignedSectionsData({
                dbClient: trx,
                examId: id,
                sectionIds: assignmentTargets.assignedSectionIds,
            });
        } else if (body.sectionIds) {
            await replaceExamAssignedSectionsData({
                dbClient: trx,
                examId: id,
                sectionIds: body.sectionIds,
            });
        }

        const affectedRooms = new Set<string>();
        if (current.room_id) {
            affectedRooms.add(current.room_id);
        }
        if (nextRoomId) {
            affectedRooms.add(nextRoomId);
        }
        if (affectedRooms.size > 0) {
            await recalculateRoomStatus(trx, Array.from(affectedRooms));
        }
    });

    const updatedExam = await getExamDetail(dbClient, id, targetInstitutionId);

    // Real-time Audit Logging integration
    if (updatedExam && targetInstitutionId) {
        try {
            await LogsService.createLog(dbClient, {
                userId,
                action: 'exam.update',
                resourceType: 'exam',
                resourceId: id,
                activeInstitutionId: targetInstitutionId,
                details: {
                    title: body.title || current.title,
                    status: body.status || current.status,
                },
            });
        } catch (logErr) {
            console.error('Failed to log exam.update event:', logErr);
        }
    }

    return updatedExam;
}

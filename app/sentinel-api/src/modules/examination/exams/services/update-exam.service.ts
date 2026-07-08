import { type DbClient } from '@sentinel/db';
import {
    hasExamConfigurationChanges,
    saveExamConfiguration,
} from '../../configuration/configuration.service';
import { assertExamConfigurationMutable } from '../../configuration/services/assert-exam-configuration-mutable.service';

import type { UpdateExamBody } from '../exam.dto';
import { getExamByIdData } from '../data/get-exam-by-id';
import { replaceExamAssignedSectionsData } from '../data/replace-exam-assigned-sections';
import { getExamColumnSupport, getExamQuestionColumnSupport } from '../helper/exam-schema-compat';
import { assertExamRoomAvailability } from './assert-exam-room-availability.service';
import { assertExamOwnership } from './assert-exam-ownership.service';
import { assertRoomBelongsToInstitution } from './assert-room-belongs-to-institution.service';
import { assertExamScheduleWindow } from './assert-exam-schedule-window.service';
import { buildUpdateExamValues } from './build-exam-write-values.service';
import { executeExamTransaction } from './execute-exam-transaction.service';
import { getExamDetail } from './get-exam-detail.service';
import { requireExamRecord } from './require-exam-record.service';
import { buildExamSectionAssignmentInputs } from './resolve-classroom-assignment.service';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';
import { createExamSectionAssignmentsBatch } from '../../section-assignments/data/create-exam-section-assignments-batch';
import { syncExamAssignmentSummary } from '../../section-assignments/data/sync-exam-assignment-summary';
import { deleteAllExamSectionAssignments } from '../../section-assignments/data/delete-all-exam-section-assignments';
import { updateExamData } from '../data/update-exam';

// Extracted modular helper services
import { syncExamStructure } from './sync-exam-structure.service';
import { resolveAssignmentTargets } from './resolve-assignment-targets.service';
import { computeAffectedRooms } from './compute-affected-rooms.service';
import { logExamUpdate } from './log-exam-update.service';

/**
 * Safely parses a datetime value into a Date object, returning null if invalid.
 */
function parseDateTime(value: string | Date | null | undefined): Date | null {
    if (value === null || value === undefined) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

/**
 * Checks if the start or end datetime of an exam has changed between request and DB.
 */
function hasDateTimeChanged(
    nextValue: string | Date | undefined,
    currentValue: string | Date | null,
): boolean {
    if (nextValue === undefined) {
        return false;
    }

    return parseDateTime(nextValue)?.getTime() !== parseDateTime(currentValue)?.getTime();
}

/**
 * Updates an exam after enforcing ownership, lock, and room constraints.
 */
export async function updateExam(
    dbClient: DbClient,
    id: string,
    body: UpdateExamBody,
    institutionId: string | undefined,
    userId: string,
    canBypassLock = false,
    canManageExam = false,
    role?: string,
) {
    const current = requireExamRecord(
        await getExamByIdData({
            dbClient,
            id,
            institutionId,
        }),
    );
    assertExamOwnership(current.created_by, userId, canManageExam, role);
    const targetInstitutionId =
        institutionId ?? body.institutionId ?? current.institution_id ?? undefined;

    const [sectionColumnSupport, questionColumnSupport] = await Promise.all([
        getExamColumnSupport(dbClient),
        getExamQuestionColumnSupport(dbClient),
    ]);

    const hasAssignmentRelevantChange =
        body.classroomId !== undefined ||
        body.classroomIds !== undefined ||
        body.sectionIds !== undefined ||
        body.roomId !== undefined ||
        body.instructorId !== undefined ||
        body.instructorIds !== undefined ||
        body.startDateTime !== undefined;

    const assignmentTargets = await resolveAssignmentTargets({
        dbClient,
        body,
        current,
        userId,
        targetInstitutionId,
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

    // Compute assignments once and reuse to avoid drift or duplicate computations.
    const nextAssignments =
        hasAssignmentRelevantChange && assignmentTargets
            ? buildExamSectionAssignmentInputs({
                  targets: assignmentTargets,
                  roomId: body.roomId !== undefined ? body.roomId : current.room_id,
                  startDateTime:
                      body.startDateTime !== undefined
                          ? body.startDateTime
                          : (parseDateTime(current.scheduled_date)?.toISOString() ?? null),
                  instructorId:
                      body.instructorId !== undefined
                          ? body.instructorId
                          : (current.created_by ?? null),
                  instructorIds: body.instructorIds !== undefined ? body.instructorIds : null,
              })
            : [];

    await executeExamTransaction(async (trx) => {
        // Re-verify room availability inside the transaction to prevent TOCTOU race conditions.
        if (shouldRecheckRoomAvailability) {
            await assertExamRoomAvailability({
                dbClient: trx,
                institutionId: targetInstitutionId,
                roomId: nextRoomId,
                startDateTime: nextStartDateTime,
                endDateTime: nextEndDateTime,
                excludeExamId: id,
            });
        }

        const updateValues = buildUpdateExamValues({
            body,
            institutionId: targetInstitutionId,
            userId,
            sectionColumnSupport,
            classroomAssignment,
        });

        if (body.status) {
            const nextStatus = body.status.toLowerCase();
            // Only 'published' and 'draft' statuses update/reset the published timestamps.
            // Other statuses (e.g. 'archived', 'cancelled') do not affect these timestamps.
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

        if (hasAssignmentRelevantChange && assignmentTargets) {
            await deleteAllExamSectionAssignments({
                dbClient: trx,
                examId: id,
            });

            if (nextAssignments.length > 0) {
                await createExamSectionAssignmentsBatch({
                    dbClient: trx,
                    examId: id,
                    assignments: nextAssignments,
                });
            }

            await syncExamAssignmentSummary({
                dbClient: trx,
                examId: id,
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

        const affectedRooms = computeAffectedRooms(current, nextRoomId, nextAssignments);

        if (affectedRooms.size > 0) {
            await recalculateRoomStatus(trx, Array.from(affectedRooms));
        }
    });

    const updatedExam = await getExamDetail(dbClient, id, targetInstitutionId);

    // Real-time Audit Logging integration
    if (updatedExam && targetInstitutionId) {
        await logExamUpdate({
            dbClient,
            userId,
            examId: id,
            institutionId: targetInstitutionId,
            currentTitle: current.title,
            currentStatus: current.status,
            body,
        });
    }

    return updatedExam;
}

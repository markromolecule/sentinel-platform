import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import {
    type AssignClassroomInstructorBody,
    type CreateClassroomBody,
    type UpdateClassroomBody,
} from './classroom.dto';
import {
    getAccessibleClassroomOrThrow,
    getInstructorClassroomById,
    getInstructorClassrooms,
} from './services/classroom-query.service';
import {
    assignInstructorToClassroom,
    ensureClassroomHeadInstructorAssignment,
    listClassroomInstructors,
    removeInstructorFromClassroom,
    acknowledgeClassroomAssignment,
    flagClassroomAssignment,
} from './services/classroom-instructor-management.service';
import {
    archiveClassroom,
    deleteClassroom,
    saveClassroomConfiguration,
    unenrollClassroomStudent,
    unarchiveClassroom,
} from './services/classroom-write.service';
import { ClassroomAssignmentDashboardService } from './services/classroom-assignment-dashboard.service';
import { LogsService } from '../../general/logs/logs.service';

export class ClassroomService {
    static async getClassrooms(
        dbClient: DbClient,
        {
            userId,
            institutionId,
            search,
            departmentId,
            userRole,
            status,
        }: {
            userId: string;
            institutionId: string;
            search?: string;
            departmentId?: string;
            userRole?: string;
            status?: 'active' | 'archived' | 'all';
        },
    ) {
        return await getInstructorClassrooms(dbClient, {
            userId,
            institutionId,
            search,
            departmentId,
            userRole,
            status,
        });
    }

    static async archiveClassroom(
        dbClient: DbClient,
        {
            classGroupId,
            userId,
            institutionId,
            userRole,
        }: {
            classGroupId: string;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        await archiveClassroom(dbClient, {
            classGroupId,
            userId,
            institutionId,
            userRole,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'classroom.archived',
                resourceType: 'classroom',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { classGroupId },
            });
        } catch (logErr) {
            console.error('Failed to log classroom.archived:', logErr);
        }
    }

    static async unarchiveClassroom(
        dbClient: DbClient,
        {
            classGroupId,
            userId,
            institutionId,
            userRole,
        }: {
            classGroupId: string;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        await unarchiveClassroom(dbClient, {
            classGroupId,
            userId,
            institutionId,
            userRole,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'classroom.unarchived',
                resourceType: 'classroom',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { classGroupId },
            });
        } catch (logErr) {
            console.error('Failed to log classroom.unarchived:', logErr);
        }
    }

    static async getClassroomById(
        dbClient: DbClient,
        {
            classGroupId,
            userId,
            institutionId,
            userRole,
        }: {
            classGroupId: string;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        return await getInstructorClassroomById(dbClient, {
            classGroupId,
            userId,
            institutionId,
            userRole,
        });
    }

    static async createClassroom(
        dbClient: DbClient,
        {
            payload,
            userId,
            institutionId,
            userRole,
        }: {
            payload: CreateClassroomBody;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        const classroom = await getAccessibleClassroomOrThrow(dbClient, {
            classGroupId: payload.classGroupId,
            userId,
            institutionId,
            userRole,
        });

        if (classroom.class_name) {
            throw new HTTPException(409, {
                message: 'This class group is already configured as a classroom.',
            });
        }

        await saveClassroomConfiguration({
            dbClient,
            classGroupId: payload.classGroupId,
            className: payload.className,
            updatedBy: userId,
        });

        await ensureClassroomHeadInstructorAssignment({
            dbClient,
            classGroupId: payload.classGroupId,
            instructorUserId: userId,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'classroom.created',
                resourceType: 'classroom',
                resourceId: payload.classGroupId,
                activeInstitutionId: institutionId,
                details: { name: payload.className },
            });
        } catch (logErr) {
            console.error('Failed to log classroom.created:', logErr);
        }

        return await ClassroomService.getClassroomById(dbClient, {
            classGroupId: payload.classGroupId,
            userId,
            institutionId,
            userRole,
        });
    }

    static async updateClassroom(
        dbClient: DbClient,
        {
            classGroupId,
            payload,
            userId,
            institutionId,
            userRole,
        }: {
            classGroupId: string;
            payload: UpdateClassroomBody;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        await getAccessibleClassroomOrThrow(dbClient, {
            classGroupId,
            userId,
            institutionId,
            userRole,
        });

        await saveClassroomConfiguration({
            dbClient,
            classGroupId,
            className: payload.className,
            updatedBy: userId,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'classroom.updated',
                resourceType: 'classroom',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { name: payload.className },
            });
        } catch (logErr) {
            console.error('Failed to log classroom.updated:', logErr);
        }

        return await ClassroomService.getClassroomById(dbClient, {
            classGroupId,
            userId,
            institutionId,
            userRole,
        });
    }

    static async deleteClassroom(
        dbClient: DbClient,
        {
            classGroupId,
            userId,
            institutionId,
            userRole,
        }: {
            classGroupId: string;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        await deleteClassroom(dbClient, {
            classGroupId,
            userId,
            institutionId,
            userRole,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'classroom.deleted',
                resourceType: 'classroom',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { classGroupId },
            });
        } catch (logErr) {
            console.error('Failed to log classroom.deleted:', logErr);
        }
    }

    static async deleteClassroomStudent(
        dbClient: DbClient,
        {
            classGroupId,
            studentId,
            userId,
            institutionId,
        }: {
            classGroupId: string;
            studentId: string;
            userId: string;
            institutionId: string;
        },
    ) {
        await unenrollClassroomStudent(dbClient, {
            classGroupId,
            studentId,
            userId,
            institutionId,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'classroom.student_removed',
                resourceType: 'classroom',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { studentId },
            });
        } catch (logErr) {
            console.error('Failed to log classroom.student_removed:', logErr);
        }
    }

    static async getClassroomInstructors(
        dbClient: DbClient,
        {
            classGroupId,
            userId,
            institutionId,
            userRole,
        }: {
            classGroupId: string;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        return await listClassroomInstructors({
            dbClient,
            classGroupId,
            userId,
            institutionId,
            userRole,
        });
    }

    static async assignClassroomInstructor(
        dbClient: DbClient,
        {
            classGroupId,
            payload,
            userId,
            institutionId,
            userRole,
        }: {
            classGroupId: string;
            payload: AssignClassroomInstructorBody;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        const result = await assignInstructorToClassroom({
            dbClient,
            classGroupId,
            instructorUserId: payload.instructorUserId,
            actorUserId: userId,
            institutionId,
            userRole,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'classroom.instructor_assigned',
                resourceType: 'classroom',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { instructorUserId: payload.instructorUserId },
            });
        } catch (logErr) {
            console.error('Failed to log classroom.instructor_assigned:', logErr);
        }

        return result;
    }

    static async removeClassroomInstructor(
        dbClient: DbClient,
        {
            classGroupId,
            instructorUserId,
            userId,
            institutionId,
            userRole,
        }: {
            classGroupId: string;
            instructorUserId: string;
            userId: string;
            institutionId: string;
            userRole?: string;
        },
    ) {
        await removeInstructorFromClassroom({
            dbClient,
            classGroupId,
            instructorUserId,
            actorUserId: userId,
            institutionId,
            userRole,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'classroom.instructor_removed',
                resourceType: 'classroom',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { instructorUserId },
            });
        } catch (logErr) {
            console.error('Failed to log classroom.instructor_removed:', logErr);
        }
    }

    static async acknowledgeClassroomAssignment(
        dbClient: DbClient,
        {
            classGroupId,
            instructorUserId,
            justification,
        }: {
            classGroupId: string;
            instructorUserId: string;
            justification?: string;
        },
    ) {
        await acknowledgeClassroomAssignment({
            dbClient,
            classGroupId,
            instructorUserId,
            justification,
        });
    }

    static async flagClassroomAssignment(
        dbClient: DbClient,
        {
            classGroupId,
            instructorUserId,
            flagReason,
            justification,
        }: {
            classGroupId: string;
            instructorUserId: string;
            flagReason: string;
            justification?: string;
        },
    ) {
        await flagClassroomAssignment({
            dbClient,
            classGroupId,
            instructorUserId,
            flagReason,
            justification,
        });
    }

    static async getUnassignedClassrooms(dbClient: DbClient, institutionId: string) {
        return await ClassroomAssignmentDashboardService.getUnassignedClassrooms(
            dbClient,
            institutionId,
        );
    }

    static async getInstructorLoadSummary(
        dbClient: DbClient,
        args: { institutionId: string; termId?: string },
    ) {
        return await ClassroomAssignmentDashboardService.getInstructorLoadSummary(dbClient, args);
    }

    static async getSmartSuggestions(
        dbClient: DbClient,
        args: { classGroupId: string; institutionId: string },
    ) {
        return await ClassroomAssignmentDashboardService.getSmartSuggestions(dbClient, args);
    }

    static async bulkAssignClassroomInstructors(
        dbClient: DbClient,
        args: {
            assignments: Array<{ classGroupId: string; instructorUserId: string }>;
            actorUserId: string;
            institutionId: string;
        },
    ) {
        return await ClassroomAssignmentDashboardService.bulkAssignInstructors(dbClient, args);
    }
}

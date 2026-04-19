import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { type CreateClassroomBody, type UpdateClassroomBody } from './classroom.dto';
import {
    getAccessibleClassroomOrThrow,
    getInstructorClassroomById,
    getInstructorClassrooms,
} from './services/classroom-query.service';
import {
    deleteClassroom,
    saveClassroomConfiguration,
    unenrollClassroomStudent,
} from './services/classroom-write.service';

export class ClassroomService {
    static async getClassrooms(
        dbClient: DbClient,
        {
            userId,
            institutionId,
            search,
        }: {
            userId: string;
            institutionId: string;
            search?: string;
        },
    ) {
        return await getInstructorClassrooms(dbClient, {
            userId,
            institutionId,
            search,
        });
    }

    static async getClassroomById(
        dbClient: DbClient,
        {
            classGroupId,
            userId,
            institutionId,
        }: {
            classGroupId: string;
            userId: string;
            institutionId: string;
        },
    ) {
        return await getInstructorClassroomById(dbClient, {
            classGroupId,
            userId,
            institutionId,
        });
    }

    static async createClassroom(
        dbClient: DbClient,
        {
            payload,
            userId,
            institutionId,
        }: {
            payload: CreateClassroomBody;
            userId: string;
            institutionId: string;
        },
    ) {
        const classroom = await getAccessibleClassroomOrThrow(dbClient, {
            classGroupId: payload.classGroupId,
            userId,
            institutionId,
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

        return await ClassroomService.getClassroomById(dbClient, {
            classGroupId: payload.classGroupId,
            userId,
            institutionId,
        });
    }

    static async updateClassroom(
        dbClient: DbClient,
        {
            classGroupId,
            payload,
            userId,
            institutionId,
        }: {
            classGroupId: string;
            payload: UpdateClassroomBody;
            userId: string;
            institutionId: string;
        },
    ) {
        await getAccessibleClassroomOrThrow(dbClient, {
            classGroupId,
            userId,
            institutionId,
        });

        await saveClassroomConfiguration({
            dbClient,
            classGroupId,
            className: payload.className,
            updatedBy: userId,
        });

        return await ClassroomService.getClassroomById(dbClient, {
            classGroupId,
            userId,
            institutionId,
        });
    }

    static async deleteClassroom(
        dbClient: DbClient,
        {
            classGroupId,
            userId,
            institutionId,
        }: {
            classGroupId: string;
            userId: string;
            institutionId: string;
        },
    ) {
        await deleteClassroom(dbClient, {
            classGroupId,
            userId,
            institutionId,
        });
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
    }
}

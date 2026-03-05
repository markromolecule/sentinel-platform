import { type DbClient } from '@/lib/create-db-client';
import type { DB } from '@/lib/types';
import { type Updateable } from 'kysely';

export type UpdateSectionDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['sections']> & {
        departmentId?: string | null;
        courseId?: string | null;
    };
};

export async function updateSectionData({ dbClient, id, values }: UpdateSectionDataArgs) {
    const { departmentId, courseId, ...restValues } = values;

    const updatedRecord = await dbClient
        .updateTable('sections')
        .set({
            ...restValues,
            ...(departmentId !== undefined
                ? { department_id: departmentId }
                : {
                      department_id: null,
                  }),
            ...(courseId !== undefined
                ? { course_id: courseId }
                : {
                      course_id: null,
                  }),
        })
        .where('section_id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateSectionDataResponse = Awaited<ReturnType<typeof updateSectionData>>;

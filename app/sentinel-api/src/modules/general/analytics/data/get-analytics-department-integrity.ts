import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetAnalyticsDepartmentIntegrityDataArgs = {
    institutionId?: string;
};

export type DepartmentIntegrityRow = {
    department: string;
    completed: number;
    flagged: number;
    dropped: number;
};

/**
 * Retrieves integrity metrics grouped by department.
 */
export async function getAnalyticsDepartmentIntegrityData(
    dbClient: DbClient,
    args: GetAnalyticsDepartmentIntegrityDataArgs,
): Promise<DepartmentIntegrityRow[]> {
    const { institutionId } = args;

    let query = dbClient
        .selectFrom('departments as d')
        .leftJoin('sections as s', 's.department_id', 'd.department_id')
        .leftJoin('exams as e', 'e.section_id', 's.section_id')
        .leftJoin('exam_attempts as ea', 'ea.exam_id', 'e.exam_id')
        .leftJoin('flagged_incidents as fi', 'fi.attempt_id', 'ea.attempt_id')
        .select([
            'd.department_name as department',
            sql<number>`coalesce(count(distinct case when ea.status = 'COMPLETED' then ea.attempt_id end), 0)`.as(
                'completed',
            ),
            sql<number>`coalesce(count(distinct case when fi.incident_id is not null then ea.attempt_id end), 0)`.as(
                'flagged',
            ),
            sql<number>`coalesce(count(distinct case when ea.status != 'COMPLETED' and ea.attempt_id is not null and fi.incident_id is null then ea.attempt_id end), 0)`.as(
                'dropped',
            ),
        ]);

    if (institutionId) {
        query = query.where('d.institution_id', '=', institutionId);
    }

    const rows = await query
        .groupBy(['d.department_id', 'd.department_name'])
        .orderBy('d.department_name', 'asc')
        .execute();

    return rows.map((row) => ({
        department: row.department,
        completed: Number(row.completed),
        flagged: Number(row.flagged),
        dropped: Number(row.dropped),
    }));
}

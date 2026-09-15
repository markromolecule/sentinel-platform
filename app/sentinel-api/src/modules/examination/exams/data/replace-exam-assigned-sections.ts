import { type DbClient } from '@sentinel/db';

export type ReplaceExamAssignedSectionsArgs = {
    dbClient: DbClient;
    examId: string;
    sectionIds: string[];
};

export async function replaceExamAssignedSectionsData({
    dbClient,
    examId,
    sectionIds,
}: ReplaceExamAssignedSectionsArgs) {
    // 1. Clear existing
    await dbClient.deleteFrom('exam_assigned_sections').where('exam_id', '=', examId).execute();

    if (sectionIds.length === 0) {
        return;
    }

    // 2. Insert new
    const values = sectionIds.map((sectionId) => ({
        exam_id: examId,
        section_id: sectionId,
        created_at: new Date(),
    }));

    await dbClient.insertInto('exam_assigned_sections').values(values).execute();

    // Mirror into exam_section_assignments to maintain unified data source
    const esaValues = sectionIds.map((sectionId) => ({
        exam_id: examId,
        section_id: sectionId,
        created_at: new Date(),
        updated_at: new Date(),
    }));

    await dbClient
        .insertInto('exam_section_assignments' as any)
        .values(esaValues)
        .onConflict((oc: any) => oc.columns(['exam_id', 'section_id']).doNothing())
        .execute();
}


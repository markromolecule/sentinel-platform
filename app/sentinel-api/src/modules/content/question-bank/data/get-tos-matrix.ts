import { type DbClient } from '@sentinel/db';

export const BLOOM_LEVELS = [
    'REMEMBERING',
    'UNDERSTANDING',
    'APPLYING',
    'ANALYZING',
    'EVALUATING',
    'CREATING',
] as const;

export type BloomLevel = (typeof BLOOM_LEVELS)[number];

export type TosMatrixRow = {
    topic: string;
    counts: Record<BloomLevel, number>;
    total: number;
};

export type TosMatrixSummary = {
    rows: TosMatrixRow[];
    columnTotals: Record<BloomLevel, number>;
    grandTotal: number;
    activeCount: number;
    retiredCount: number;
};

/**
 * Aggregates question_bank_questions into a TOS matrix:
 * rows = distinct topics, columns = Bloom's cognitive levels.
 * Only includes questions with status = 'ACTIVE'.
 */
export async function getTosMatrixData(args: {
    dbClient: DbClient;
    institutionId?: string | null;
}): Promise<TosMatrixSummary> {
    const { dbClient, institutionId } = args;

    let query = dbClient
        .selectFrom('question_bank_questions')
        .select(['topic', 'cognitive_level', 'status']);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const rows = await query.execute();

    // Count active vs retired
    const activeCount = rows.filter((r) => r.status === 'ACTIVE').length;
    const retiredCount = rows.filter((r) => r.status === 'RETIRED').length;

    // Build matrix only from ACTIVE questions that have topic + cognitive_level
    const activeWithTos = rows.filter((r) => r.status === 'ACTIVE' && r.topic && r.cognitive_level);

    const topicMap = new Map<string, Record<BloomLevel, number>>();

    for (const row of activeWithTos) {
        const topic = row.topic!;
        const level = row.cognitive_level as BloomLevel;

        if (!topicMap.has(topic)) {
            const empty = Object.fromEntries(BLOOM_LEVELS.map((l) => [l, 0])) as Record<
                BloomLevel,
                number
            >;
            topicMap.set(topic, empty);
        }

        if (BLOOM_LEVELS.includes(level as any)) {
            topicMap.get(topic)![level]++;
        }
    }

    const columnTotals = Object.fromEntries(BLOOM_LEVELS.map((l) => [l, 0])) as Record<
        BloomLevel,
        number
    >;

    const matrixRows: TosMatrixRow[] = Array.from(topicMap.entries()).map(([topic, counts]) => {
        const total = Object.values(counts).reduce((s, n) => s + n, 0);
        BLOOM_LEVELS.forEach((l) => (columnTotals[l] += counts[l]));
        return { topic, counts, total };
    });

    const grandTotal = Object.values(columnTotals).reduce((s, n) => s + n, 0);

    return {
        rows: matrixRows,
        columnTotals,
        grandTotal,
        activeCount,
        retiredCount,
    };
}

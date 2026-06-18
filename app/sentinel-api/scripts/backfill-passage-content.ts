import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

type Mode = 'dry-run' | 'apply';

type TableConfig = {
    label: string;
    table: string;
    idColumn: string;
};

type BackfillSampleRow = {
    id: string;
    sourceEvidence: string;
    passageContent: string | null;
};

type TableBackfillResult = {
    label: string;
    eligibleCount: number;
    totalLegacyCount: number;
    updatedCount: number;
    samples: BackfillSampleRow[];
};

const TABLES: TableConfig[] = [
    {
        label: 'question_bank_questions',
        table: 'public.question_bank_questions',
        idColumn: 'question_bank_question_id',
    },
];

function parseArgs(argv: string[]) {
    const args: Record<string, string | boolean> = {};

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];

        if (!arg.startsWith('--')) {
            continue;
        }

        const key = arg.slice(2);
        const next = argv[index + 1];

        if (!next || next.startsWith('--')) {
            args[key] = true;
            continue;
        }

        args[key] = next;
        index += 1;
    }

    return args;
}

function resolveMode(args: Record<string, string | boolean>): Mode {
    if (args.apply === true) {
        return 'apply';
    }

    return 'dry-run';
}

function resolveSampleLimit(args: Record<string, string | boolean>) {
    const rawLimit = typeof args.limit === 'string' ? Number(args.limit) : 5;

    if (!Number.isInteger(rawLimit) || rawLimit < 0) {
        throw new Error('Invalid --limit value. Use a non-negative integer.');
    }

    return rawLimit;
}

function resolveDatabaseUrl() {
    return process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? null;
}

async function query<T extends Record<string, unknown>>(
    client: pg.Client,
    sql: string,
    params: unknown[] = [],
) {
    const result = await client.query<T>(sql, params);
    return result.rows;
}

async function fetchTableStats(
    client: pg.Client,
    table: TableConfig,
    sampleLimit: number,
): Promise<Omit<TableBackfillResult, 'updatedCount'>> {
    const counts = await query<{ eligible_count: string; legacy_count: string }>(
        client,
        `
            select
                count(*) filter (
                    where passage_content is null
                      and coalesce(btrim(source_evidence), '') <> ''
                )::text as eligible_count,
                count(*) filter (
                    where coalesce(btrim(source_evidence), '') <> ''
                )::text as legacy_count
            from ${table.table}
        `,
    );

    const samples = await query<BackfillSampleRow>(
        client,
        `
            select
                ${table.idColumn}::text as id,
                source_evidence as "sourceEvidence",
                passage_content as "passageContent"
            from ${table.table}
            where passage_content is null
              and coalesce(btrim(source_evidence), '') <> ''
            order by created_at nulls last, ${table.idColumn}
            limit $1
        `,
        [sampleLimit],
    );

    return {
        label: table.label,
        eligibleCount: Number(counts[0]?.eligible_count ?? 0),
        totalLegacyCount: Number(counts[0]?.legacy_count ?? 0),
        samples,
    };
}

async function applyTableBackfill(client: pg.Client, table: TableConfig): Promise<number> {
    const updatedRows = await query<{ id: string }>(
        client,
        `
            update ${table.table}
            set
                passage_content = source_evidence,
                passage_type = 'plain'
            where passage_content is null
              and coalesce(btrim(source_evidence), '') <> ''
            returning ${table.idColumn}::text as id
        `,
    );

    return updatedRows.length;
}

function printTableResult(result: TableBackfillResult, mode: Mode) {
    console.log(`\n[${result.label}]`);
    console.log(`Legacy rows with source evidence: ${result.totalLegacyCount}`);
    console.log(`Rows eligible for backfill: ${result.eligibleCount}`);

    if (mode === 'apply') {
        console.log(`Rows updated: ${result.updatedCount}`);
    }

    if (result.samples.length === 0) {
        console.log('Sample rows: none');
        return;
    }

    console.log('Sample rows:');
    for (const sample of result.samples) {
        const targetPreview = sample.passageContent ?? sample.sourceEvidence;
        console.log(
            `- ${sample.id}: sourceEvidence="${sample.sourceEvidence.slice(0, 80)}" passageContent="${targetPreview.slice(0, 80)}"`,
        );
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.help === true) {
        console.log('Usage: pnpm --dir app/sentinel-api exec tsx -r dotenv/config scripts/backfill-passage-content.ts [--apply] [--limit N]');
        console.log('Default mode is dry-run. Use --apply to update rows.');
        return;
    }

    const mode = resolveMode(args);
    const sampleLimit = resolveSampleLimit(args);
    const databaseUrl = resolveDatabaseUrl();

    if (!databaseUrl) {
        throw new Error('Missing DIRECT_URL or DATABASE_URL in the environment.');
    }

    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();
        console.log(`Connected to database. Mode: ${mode}. Sample limit: ${sampleLimit}.`);

        if (mode === 'apply') {
            await client.query('begin');
        }

        for (const table of TABLES) {
            const baseStats = await fetchTableStats(client, table, sampleLimit);
            let updatedCount = 0;

            if (mode === 'apply') {
                updatedCount = await applyTableBackfill(client, table);
            }

            const result: TableBackfillResult = {
                ...baseStats,
                updatedCount,
            };

            printTableResult(result, mode);
        }

        if (mode === 'apply') {
            await client.query('commit');
            console.log('\nBackfill complete.');
        } else {
            console.log('\nDry-run complete. Re-run with --apply to persist changes.');
        }
    } catch (error) {
        if (mode === 'apply') {
            await client.query('rollback').catch(() => {});
        }

        console.error('Backfill failed:', error);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
}

main();

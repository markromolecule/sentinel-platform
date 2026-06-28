import { dbClient } from '@sentinel/db';

/**
 * Script to backfill total_score for existing COMPLETED attempts that have a null total_score.
 * It maps each attempt's exam to its total possible points and updates the attempt record.
 */
export async function backfillTotalScores() {
    console.log('Starting backfill for completed attempts with null total_score...');

    // 1. Fetch all completed attempts that lack total_score
    const attempts = await dbClient
        .selectFrom('exam_attempts')
        .select(['attempt_id', 'exam_id'])
        .where('status', '=', 'COMPLETED')
        .where('total_score', 'is', null)
        .execute();

    if (attempts.length === 0) {
        console.log('No completed attempts with null total_score found.');
        return 0;
    }

    console.log(`Found ${attempts.length} attempts to backfill.`);

    // 2. Fetch distinct exam IDs to calculate their total points
    const examIds = Array.from(new Set(attempts.map(a => a.exam_id)));
    const examPointsMap = new Map<string, number>();

    for (const examId of examIds) {
        const questions = await dbClient
            .selectFrom('exam_questions')
            .select(['points'])
            .where('exam_id', '=', examId)
            .execute();
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        examPointsMap.set(examId, totalPoints);
    }

    // 3. Update attempts with calculated total scores
    let updatedCount = 0;
    for (const attempt of attempts) {
        const totalPoints = examPointsMap.get(attempt.exam_id) ?? 0;

        await dbClient
            .updateTable('exam_attempts')
            .set({
                total_score: totalPoints,
                last_synced_at: new Date(),
            })
            .where('attempt_id', '=', attempt.attempt_id)
            .execute();

        updatedCount++;
    }

    console.log(`Successfully backfilled ${updatedCount} attempts.`);
    return updatedCount;
}

// Self-execute if run directly
if (require.main === module) {
    backfillTotalScores()
        .then(() => {
            console.log('Backfill execution complete.');
            process.exit(0);
        })
        .catch(err => {
            console.error('Backfill execution failed:', err);
            process.exit(1);
        });
}

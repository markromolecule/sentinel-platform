import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    calibrateQuestionDifficulty,
    mapPValueToDifficulty,
    type CalibrateQuestionDifficultyDependencies,
} from '../../modules/content/question-bank/services/calibrate-question-difficulty';

// ---------------------------------------------------------------------------
// mapPValueToDifficulty — pure function unit tests
// ---------------------------------------------------------------------------

describe('mapPValueToDifficulty', () => {
    it('maps P-Value of 1.0 to EASY', () => {
        expect(mapPValueToDifficulty(1.0)).toBe('EASY');
    });

    it('maps P-Value of 0.85 to EASY (boundary)', () => {
        expect(mapPValueToDifficulty(0.85)).toBe('EASY');
    });

    it('maps P-Value of 0.84 to MODERATE (just below EASY threshold)', () => {
        expect(mapPValueToDifficulty(0.84)).toBe('MODERATE');
    });

    it('maps P-Value of 0.50 to MODERATE', () => {
        expect(mapPValueToDifficulty(0.5)).toBe('MODERATE');
    });

    it('maps P-Value of 0.30 to HARD (boundary)', () => {
        expect(mapPValueToDifficulty(0.3)).toBe('HARD');
    });

    it('maps P-Value of 0.29 to HARD (just below HARD threshold)', () => {
        expect(mapPValueToDifficulty(0.29)).toBe('HARD');
    });

    it('maps P-Value of 0.0 to HARD', () => {
        expect(mapPValueToDifficulty(0.0)).toBe('HARD');
    });
});

// ---------------------------------------------------------------------------
// calibrateQuestionDifficulty — service integration tests with mocked deps
// ---------------------------------------------------------------------------

describe('calibrateQuestionDifficulty', () => {
    const mockDbClient = {} as any;

    const buildDeps = (
        statsOverride: Array<{
            questionBankQuestionId: string;
            correctCount: number;
            totalAttempted: number;
        }>,
    ): CalibrateQuestionDifficultyDependencies => ({
        getQuestionPerformanceStats: vi.fn().mockResolvedValue(statsOverride),
        updateQuestionActualDifficultyData: vi.fn().mockResolvedValue(undefined),
    });

    it('returns empty arrays when no question IDs provided', async () => {
        const deps = buildDeps([]);
        const result = await calibrateQuestionDifficulty({
            dbClient: mockDbClient,
            questionBankQuestionIds: [],
            dependencies: deps,
        });

        expect(result.calibrated).toHaveLength(0);
        expect(result.skipped).toHaveLength(0);
        expect(deps.getQuestionPerformanceStats).not.toHaveBeenCalled();
    });

    it('skips questions with 0 total attempts', async () => {
        const id = 'qbq-1';
        const deps = buildDeps([
            { questionBankQuestionId: id, correctCount: 0, totalAttempted: 0 },
        ]);

        const result = await calibrateQuestionDifficulty({
            dbClient: mockDbClient,
            questionBankQuestionIds: [id],
            dependencies: deps,
        });

        expect(result.skipped).toContain(id);
        expect(result.calibrated).toHaveLength(0);
        expect(deps.updateQuestionActualDifficultyData).not.toHaveBeenCalled();
    });

    it('skips questions absent from stats (no attempt data)', async () => {
        const id = 'qbq-absent';
        const deps = buildDeps([]); // no stats returned

        const result = await calibrateQuestionDifficulty({
            dbClient: mockDbClient,
            questionBankQuestionIds: [id],
            dependencies: deps,
        });

        expect(result.skipped).toContain(id);
        expect(result.calibrated).toHaveLength(0);
    });

    it('calibrates P=0.9 (9/10 correct) as EASY', async () => {
        const id = 'qbq-easy';
        const deps = buildDeps([
            { questionBankQuestionId: id, correctCount: 9, totalAttempted: 10 },
        ]);

        const result = await calibrateQuestionDifficulty({
            dbClient: mockDbClient,
            questionBankQuestionIds: [id],
            dependencies: deps,
        });

        expect(result.calibrated).toHaveLength(1);
        expect(result.calibrated[0]).toMatchObject({
            questionBankQuestionId: id,
            actualDifficulty: 'EASY',
        });
        expect(deps.updateQuestionActualDifficultyData).toHaveBeenCalledOnce();
    });

    it('calibrates P=0.2 (2/10 correct) as HARD', async () => {
        const id = 'qbq-hard';
        const deps = buildDeps([
            { questionBankQuestionId: id, correctCount: 2, totalAttempted: 10 },
        ]);

        const result = await calibrateQuestionDifficulty({
            dbClient: mockDbClient,
            questionBankQuestionIds: [id],
            dependencies: deps,
        });

        expect(result.calibrated[0]).toMatchObject({
            questionBankQuestionId: id,
            actualDifficulty: 'HARD',
        });
    });

    it('calibrates P=0.5 (5/10 correct) as MODERATE', async () => {
        const id = 'qbq-moderate';
        const deps = buildDeps([
            { questionBankQuestionId: id, correctCount: 5, totalAttempted: 10 },
        ]);

        const result = await calibrateQuestionDifficulty({
            dbClient: mockDbClient,
            questionBankQuestionIds: [id],
            dependencies: deps,
        });

        expect(result.calibrated[0]).toMatchObject({
            questionBankQuestionId: id,
            actualDifficulty: 'MODERATE',
        });
    });

    it('handles mixed calibrated + skipped questions', async () => {
        const calibratedId = 'qbq-has-data';
        const skippedId = 'qbq-no-data';

        const deps = buildDeps([
            { questionBankQuestionId: calibratedId, correctCount: 8, totalAttempted: 10 },
            // skippedId deliberately absent from stats
        ]);

        const result = await calibrateQuestionDifficulty({
            dbClient: mockDbClient,
            questionBankQuestionIds: [calibratedId, skippedId],
            dependencies: deps,
        });

        expect(result.calibrated).toHaveLength(1);
        expect(result.calibrated[0].questionBankQuestionId).toBe(calibratedId);
        expect(result.skipped).toContain(skippedId);
    });

    it('does not call updateQuestionActualDifficultyData when all questions are skipped', async () => {
        const deps = buildDeps([]); // no stats — all skipped

        const result = await calibrateQuestionDifficulty({
            dbClient: mockDbClient,
            questionBankQuestionIds: ['qbq-1', 'qbq-2'],
            dependencies: deps,
        });

        expect(result.calibrated).toHaveLength(0);
        expect(result.skipped).toHaveLength(2);
        expect(deps.updateQuestionActualDifficultyData).not.toHaveBeenCalled();
    });
});

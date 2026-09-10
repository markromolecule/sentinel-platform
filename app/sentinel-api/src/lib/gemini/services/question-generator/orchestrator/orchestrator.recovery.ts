import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { PassageQualityValidationError } from '../../question-normalizer';
import type { ExtractedPdfDocument } from '../pdf-page-extractor';
import type { LlmFile, QuestionGeneratorLlmProvider } from '../types';
import {
    MAX_PASSAGE_REPAIR_ROUNDS,
    MAX_DEFICIT_REPLENISHMENT_ROUNDS,
    isBlockingPassageFailure,
} from './orchestrator.constants';
import {
    reconcileQuestionSlots,
    type ReconciliationResult,
} from '../steps/reconcile-question-slots';
import { replenishQuestionDeficits } from '../steps/replenish-question-deficits';
import {
    assessPassageQuality,
    type AssessPassageQualityResult,
} from '../steps/assess-passage-quality';
import { repairInvalidQuestions } from '../steps/repair-invalid-questions';

/**
 * Loops to replenish initial question deficits until the requested count is achieved
 * or the maximum allowed replenishment rounds are exhausted.
 */
export async function replenishInitialDeficitsLoop(args: {
    reconciliation: ReconciliationResult;
    candidateQuestions: any[];
    config: GenerateQuestionPreviewConfig;
    files: File[];
    uploadedFiles: LlmFile[];
    sourceDocuments: ExtractedPdfDocument[];
    model: string;
    provider: QuestionGeneratorLlmProvider;
}): Promise<{
    candidateQuestions: any[];
    reconciliation: ReconciliationResult;
}> {
    const { config, files, uploadedFiles, sourceDocuments, model, provider } = args;
    let { reconciliation, candidateQuestions } = args;

    let replenishmentRound = 0;
    while (
        reconciliation.deficits.length > 0 &&
        replenishmentRound < MAX_DEFICIT_REPLENISHMENT_ROUNDS
    ) {
        replenishmentRound++;
        const missingCount = reconciliation.deficits.reduce(
            (total, deficit) => total + deficit.count,
            0,
        );
        console.log(
            `Running deficit replenishment round ${replenishmentRound} for ${missingCount} missing questions.`,
        );

        const replenishedQuestions = await replenishQuestionDeficits({
            reconciliation,
            config,
            files,
            uploadedFiles,
            sourceDocuments,
            model,
            provider,
        });

        candidateQuestions.push(...replenishedQuestions);
        reconciliation = reconcileQuestionSlots(candidateQuestions, config);
    }

    if (reconciliation.deficits.length > 0) {
        throw new HTTPException(502, {
            message:
                'Gemini did not return the requested number of valid questions. Please try generating the preview again with smaller files or a smaller question count.',
        });
    }

    return { candidateQuestions, reconciliation };
}

/**
 * Evaluates passage quality and executes targeted repair rounds on failed slots.
 */
export async function repairPassageQualityLoop(args: {
    reconciliation: ReconciliationResult;
    config: GenerateQuestionPreviewConfig;
    files: File[];
    uploadedFiles: LlmFile[];
    model: string;
    provider: QuestionGeneratorLlmProvider;
}): Promise<{
    assessResult: AssessPassageQualityResult;
    reconciliation: ReconciliationResult;
}> {
    const { config, files, uploadedFiles, model, provider } = args;
    const { reconciliation } = args;

    let assessResult = await assessPassageQuality(
        reconciliation.slots,
        config,
        model,
        provider,
    );

    let currentRound = 0;
    while (
        assessResult.failedSlots.length > 0 &&
        currentRound < MAX_PASSAGE_REPAIR_ROUNDS
    ) {
        const failedSlotsToRepair =
            currentRound === 0
                ? assessResult.failedSlots
                : assessResult.failedSlots.filter(isBlockingPassageFailure);

        if (failedSlotsToRepair.length === 0) {
            break;
        }

        currentRound++;
        console.log(
            `Running repair round ${currentRound} for ${failedSlotsToRepair.length} failed slots.`,
        );

        const repaired = await repairInvalidQuestions({
            failedSlots: failedSlotsToRepair,
            config,
            files,
            uploadedFiles,
            model,
            provider,
        });
        const repairedSlotIds = new Set(failedSlotsToRepair.map((slot) => slot.slotId));

        for (const rep of repaired) {
            const slotIndex = reconciliation.slots.findIndex(
                (s) => s.slotId === rep.slotId,
            );
            if (slotIndex === -1) continue;

            if (rep.passageContent && reconciliation.slots[slotIndex].question) {
                reconciliation.slots[slotIndex].question = {
                    ...reconciliation.slots[slotIndex].question,
                    passageContent: rep.passageContent,
                };
            }
        }

        const repairedSlots = reconciliation.slots.filter((slot) =>
            repairedSlotIds.has(slot.slotId),
        );
        assessResult = await assessPassageQuality(
            repairedSlots,
            config,
            model,
            provider,
        );
    }

    return { assessResult, reconciliation };
}

/**
 * Recovers from persistent blocking passage quality violations by discarding flawed items
 * and replenishing with clean fresh questions.
 */
export async function recoverFromBlockingFailuresLoop(args: {
    assessResult: AssessPassageQualityResult;
    reconciliation: ReconciliationResult;
    candidateQuestions: any[];
    config: GenerateQuestionPreviewConfig;
    files: File[];
    uploadedFiles: LlmFile[];
    sourceDocuments: ExtractedPdfDocument[];
    model: string;
    provider: QuestionGeneratorLlmProvider;
}): Promise<{
    candidateQuestions: any[];
    reconciliation: ReconciliationResult;
}> {
    const { assessResult, config, files, uploadedFiles, sourceDocuments, model, provider } = args;
    let { reconciliation, candidateQuestions } = args;

    const blockingFailures = assessResult.failedSlots.filter(isBlockingPassageFailure);

    if (blockingFailures.length > 0) {
        console.warn(
            `Passage repair exhausted for ${blockingFailures.length} slots with blocking violations. Discarding flawed items and replenishing with fresh questions:`,
            blockingFailures.map((f) => ({ slotId: f.slotId, type: f.type, violations: f.violations })),
        );

        const failedSlotIds = new Set(blockingFailures.map((f) => f.slotId));

        // Retain only valid non-blocking questions
        const validQuestions = reconciliation.slots
            .filter((s) => !failedSlotIds.has(s.slotId) && s.question !== null)
            .map((s) => s.question);

        candidateQuestions.length = 0;
        candidateQuestions.push(...validQuestions);
        reconciliation = reconcileQuestionSlots(candidateQuestions, config);

        let postRepairReplenishRound = 0;
        while (
            reconciliation.deficits.length > 0 &&
            postRepairReplenishRound < MAX_DEFICIT_REPLENISHMENT_ROUNDS
        ) {
            postRepairReplenishRound++;
            console.log(
                `Running post-repair deficit replenishment round ${postRepairReplenishRound} for ${reconciliation.deficits.reduce((acc, d) => acc + d.count, 0)} missing questions.`,
            );

            const replenishedQuestions = await replenishQuestionDeficits({
                reconciliation,
                config,
                files,
                uploadedFiles,
                sourceDocuments,
                model,
                provider,
            });

            const replenishedSlots = replenishedQuestions.map((q, idx) => ({
                slotId: `replenished-slot-${postRepairReplenishRound}-${idx}`,
                type: q.type,
                question: q,
            }));

            const replenishedAssessResult = await assessPassageQuality(
                replenishedSlots,
                config,
                model,
                provider,
            );

            const replenishedBlocking = replenishedAssessResult.failedSlots.filter(isBlockingPassageFailure);
            if (replenishedBlocking.length > 0) {
                const repairedReplenished = await repairInvalidQuestions({
                    failedSlots: replenishedBlocking,
                    config,
                    files,
                    uploadedFiles,
                    model,
                    provider,
                });
                for (const rep of repairedReplenished) {
                    const repSlot = replenishedSlots.find((s) => s.slotId === rep.slotId);
                    if (repSlot && rep.passageContent && repSlot.question) {
                        repSlot.question.passageContent = rep.passageContent;
                    }
                }
            }

            const finalReplenishedAssess = await assessPassageQuality(
                replenishedSlots,
                config,
                model,
                provider,
            );
            const finalReplenishedBlockingIds = new Set(
                finalReplenishedAssess.failedSlots.filter(isBlockingPassageFailure).map((f) => f.slotId),
            );
            const validReplenished = replenishedSlots
                .filter((s) => !finalReplenishedBlockingIds.has(s.slotId))
                .map((s) => s.question);

            candidateQuestions.push(...validReplenished);
            reconciliation = reconcileQuestionSlots(candidateQuestions, config);
        }

        const residualDeficits = reconciliation.deficits.reduce((total, d) => total + d.count, 0);
        if (residualDeficits > 0) {
            console.error(
                `Deficit replenishment exhausted with ${residualDeficits} missing questions after passage quality recovery.`,
            );
            throw new PassageQualityValidationError(
                'AI passage generation did not meet the required quality criteria. Reframed questions could not be generated without leaking answers.',
                {
                    violations: blockingFailures.flatMap((s) =>
                        (s.violations || []).map((code, idx) => ({
                            code,
                            message: s.reasons?.[idx] || 'Quality violation',
                        })),
                    ),
                },
            );
        }
    }

    if (assessResult.failedSlots.length > 0) {
        console.warn(
            `Continuing with ${assessResult.failedSlots.length} non-blocking passage quality warnings after repair.`,
        );
    }

    return { candidateQuestions, reconciliation };
}

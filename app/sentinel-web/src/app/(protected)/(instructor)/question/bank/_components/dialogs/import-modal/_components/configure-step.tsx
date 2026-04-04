"use client";

import { useMemo } from "react";
import type { QuestionType } from "@sentinel/shared/types";
import type { QuestionTypeDistributionItem } from "../_types";
import { useProcessingProgress } from "../_hooks/use-processing-progress";
import { GenerationSummary } from "./configure-step/generation-summary";
import { QuestionTypeGrid } from "./configure-step/question-type-grid";
import { SelectedMixList } from "./configure-step/selected-mix-list";
import { ProcessingStatus } from "./configure-step/processing-status";

interface ConfigureStepProps {
    filesCount: number;
    questionCount: number;
    questionTypeDistribution: QuestionTypeDistributionItem[];
    onToggleType: (type: QuestionType) => void;
    onTypeCountChange: (type: QuestionType, count: number) => void;
    isProcessing: boolean;
}

export function ConfigureStep({
    filesCount,
    questionCount,
    questionTypeDistribution,
    onToggleType,
    onTypeCountChange,
    isProcessing,
}: ConfigureStepProps) {
    const { processingProgress, currentStep } = useProcessingProgress({
        isProcessing,
        filesCount,
        questionCount,
    });

    const selectedTypes = useMemo(
        () => new Set(questionTypeDistribution.map((item) => item.type)),
        [questionTypeDistribution],
    );

    return (
        <div className="flex min-h-0 flex-col gap-4 py-1">
            <GenerationSummary filesCount={filesCount} questionCount={questionCount} />

            <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
                <QuestionTypeGrid
                    questionTypeDistribution={questionTypeDistribution}
                    selectedTypes={selectedTypes}
                    onToggleType={onToggleType}
                />

                <SelectedMixList
                    questionTypeDistribution={questionTypeDistribution}
                    onTypeCountChange={onTypeCountChange}
                />
            </div>

            <ProcessingStatus
                isProcessing={isProcessing}
                progress={processingProgress}
                currentStep={currentStep}
            />
        </div>
    );
}

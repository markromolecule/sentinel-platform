'use client';

import { useStableValue } from '@sentinel/hooks';
import type { QuestionType, BloomCognitiveLevel } from '@sentinel/shared';
import type { QuestionTypeDistributionItem } from '../_types';
import { useProcessingProgress } from '../_hooks/use-processing-progress';
import { GenerationSummary } from './configure-step/generation-summary';
import { QuestionTypeGrid } from './configure-step/question-type-grid';
import { BloomCategorySelector } from './configure-step/bloom-category-selector';
import { ProcessingStatus } from './configure-step/processing-status';

interface ConfigureStepProps {
    filesCount: number;
    questionCount: number;
    questionTypeDistribution: QuestionTypeDistributionItem[];
    onToggleType: (type: QuestionType) => void;
    onTypeCountChange: (type: QuestionType, count: number) => void;
    isProcessing: boolean;
    selectedBloomLevels: BloomCognitiveLevel[];
    onToggleBloomLevel: (level: BloomCognitiveLevel) => void;
}

export function ConfigureStep({
    filesCount,
    questionCount,
    questionTypeDistribution,
    onToggleType,
    onTypeCountChange,
    isProcessing,
    selectedBloomLevels,
    onToggleBloomLevel,
}: ConfigureStepProps) {
    const { processingProgress, currentStep } = useProcessingProgress({
        isProcessing,
        filesCount,
        questionCount,
    });

    const selectedTypes = useStableValue(
        () => new Set(questionTypeDistribution.map((item) => item.type)),
        [questionTypeDistribution],
    );

    return (
        <div className="flex min-h-0 flex-col gap-4 py-1">
            <GenerationSummary filesCount={filesCount} questionCount={questionCount} />

            <div
                className={`grid min-h-0 gap-6 lg:grid-cols-2 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
            >
                {/* Left Column: Question Types Configuration */}
                <div className="flex flex-col gap-4">
                    <QuestionTypeGrid
                        questionTypeDistribution={questionTypeDistribution}
                        selectedTypes={selectedTypes}
                        onToggleType={onToggleType}
                        onTypeCountChange={onTypeCountChange}
                    />
                </div>

                {/* Right Column: Bloom's Taxonomy */}
                <div className="flex flex-col gap-4">
                    <BloomCategorySelector
                        selectedBloomLevels={selectedBloomLevels}
                        onToggleBloomLevel={onToggleBloomLevel}
                    />
                </div>
            </div>

            <ProcessingStatus
                isProcessing={isProcessing}
                progress={processingProgress}
                currentStep={currentStep}
            />
        </div>
    );
}

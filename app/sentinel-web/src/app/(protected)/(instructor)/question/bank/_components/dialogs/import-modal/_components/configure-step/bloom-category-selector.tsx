'use client';

import { Checkbox, Label } from '@sentinel/ui';
import type { BloomCognitiveLevel } from '@sentinel/shared';

interface BloomCategorySelectorProps {
    selectedBloomLevels: BloomCognitiveLevel[];
    onToggleBloomLevel: (level: BloomCognitiveLevel) => void;
}

const BLOOM_LEVELS_METADATA: {
    value: BloomCognitiveLevel;
    label: string;
    description: string;
}[] = [
    {
        value: 'REMEMBERING',
        label: 'Remembering',
        description: 'Recall facts, retrieve definitions, and memorize basic concepts.',
    },
    {
        value: 'UNDERSTANDING',
        label: 'Understanding',
        description: 'Explain ideas or concepts, interpret instructions, and summarize information.',
    },
    {
        value: 'APPLYING',
        label: 'Applying',
        description: 'Use information in new situations, solve problems, and execute procedures.',
    },
    {
        value: 'ANALYZING',
        label: 'Analyzing',
        description: 'Draw connections among ideas, differentiate, organize, and structure data.',
    },
    {
        value: 'EVALUATING',
        label: 'Evaluating',
        description: 'Justify a stand or decision, critique, appraise, and defend choices.',
    },
    {
        value: 'CREATING',
        label: 'Creating',
        description: 'Produce new or original work, design, build, formulate, and author.',
    },
];

export function BloomCategorySelector({
    selectedBloomLevels,
    onToggleBloomLevel,
}: BloomCategorySelectorProps) {
    return (
        <div className="rounded-xl border">
            <div className="border-b px-4 py-3">
                <h3 className="text-sm font-medium">Bloom&apos;s Taxonomy Cognitive Levels</h3>
                <p className="text-muted-foreground text-xs">
                    Select which cognitive levels the AI should target when generating questions.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-2">
                {BLOOM_LEVELS_METADATA.map((level) => {
                    const isSelected = selectedBloomLevels.includes(level.value);

                    return (
                        <div
                            key={level.value}
                            className={`group cursor-pointer rounded-xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-start gap-3 p-3 ${
                                isSelected
                                    ? 'border-[#323d8f] bg-[#323d8f]/5 shadow-sm'
                                    : 'border-border hover:bg-muted/30 hover:border-[#323d8f]/30'
                            }`}
                            onClick={() => onToggleBloomLevel(level.value)}
                        >
                            <Checkbox
                                id={level.value}
                                checked={isSelected}
                                onCheckedChange={() => onToggleBloomLevel(level.value)}
                                className="mt-0.5 data-[state=checked]:border-[#323d8f] data-[state=checked]:bg-[#323d8f]"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="min-w-0 flex-1 space-y-0.5">
                                <Label
                                    htmlFor={level.value}
                                    className="cursor-pointer text-sm leading-none font-semibold group-hover:text-primary transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {level.label}
                                </Label>
                                <p className="text-muted-foreground text-xs leading-normal">
                                    {level.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

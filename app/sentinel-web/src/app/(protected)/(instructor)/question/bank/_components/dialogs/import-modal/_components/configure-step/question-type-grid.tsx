'use client';

import { Checkbox, Label, Input } from '@sentinel/ui';
import { QUESTION_TYPE_OPTIONS } from '@sentinel/shared/constants';
import type { QuestionType } from '@sentinel/shared/types';
import type { QuestionTypeDistributionItem } from '../../_types';

interface QuestionTypeGridProps {
    questionTypeDistribution: QuestionTypeDistributionItem[];
    selectedTypes: Set<QuestionType>;
    onToggleType: (type: QuestionType) => void;
    onTypeCountChange: (type: QuestionType, count: number) => void;
}

export function QuestionTypeGrid({
    questionTypeDistribution,
    selectedTypes,
    onToggleType,
    onTypeCountChange,
}: QuestionTypeGridProps) {
    return (
        <div className="rounded-xl border">
            <div className="border-b px-4 py-3">
                <h3 className="text-sm font-medium">Question types</h3>
                <p className="text-muted-foreground text-xs">
                    Choose the formats to include in the generated preview.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-3">
                {QUESTION_TYPE_OPTIONS.map((type) => {
                    const selectedType = questionTypeDistribution.find(
                        (item) => item.type === type.value,
                    );

                    return (
                        <div
                            key={type.value}
                            className={`cursor-pointer rounded-xl border transition-all flex min-h-12 items-center gap-2.5 p-2.5 ${
                                selectedTypes.has(type.value)
                                    ? 'border-[#323d8f] bg-[#323d8f]/5 shadow-sm'
                                    : 'border-border hover:bg-muted/30 hover:border-[#323d8f]/30'
                            }`}
                            onClick={() => onToggleType(type.value as QuestionType)}
                        >
                            <Checkbox
                                id={type.value}
                                checked={selectedTypes.has(type.value as QuestionType)}
                                onCheckedChange={() => onToggleType(type.value as QuestionType)}
                                className="data-[state=checked]:border-[#323d8f] data-[state=checked]:bg-[#323d8f]"
                            />
                            <div className="min-w-0 flex-1">
                                <Label
                                    htmlFor={type.value}
                                    className="cursor-pointer text-sm leading-tight font-medium"
                                >
                                    {type.label}
                                </Label>
                            </div>
                            {selectedType ? (
                                <div className="w-14 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        className="h-7 px-1 text-center text-xs font-semibold focus-visible:ring-1 focus-visible:ring-[#323d8f]"
                                        value={selectedType.count}
                                        onChange={(event) =>
                                            onTypeCountChange(
                                                type.value as QuestionType,
                                                Number.parseInt(event.target.value, 10) || 0,
                                            )
                                        }
                                    />
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

'use client';

import { Card, CardContent, Checkbox, Label, Badge } from '@sentinel/ui';
import { QUESTION_TYPE_OPTIONS } from '@sentinel/shared/constants';
import type { QuestionType } from '@sentinel/shared/types';
import type { QuestionTypeDistributionItem } from '../../_types';

interface QuestionTypeGridProps {
    questionTypeDistribution: QuestionTypeDistributionItem[];
    selectedTypes: Set<QuestionType>;
    onToggleType: (type: QuestionType) => void;
}

export function QuestionTypeGrid({
    questionTypeDistribution,
    selectedTypes,
    onToggleType,
}: QuestionTypeGridProps) {
    return (
        <div className="rounded-xl border">
            <div className="border-b px-4 py-3">
                <h3 className="text-sm font-medium">Question types</h3>
                <p className="text-xs text-muted-foreground">
                    Choose the formats to include in the generated preview.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-3 md:grid-cols-3">
                {QUESTION_TYPE_OPTIONS.map((type) => {
                    const selectedType = questionTypeDistribution.find(
                        (item) => item.type === type.value,
                    );

                    return (
                        <Card
                            key={type.value}
                            className={`cursor-pointer transition-all border ${selectedTypes.has(type.value)
                                    ? 'border-[#323d8f] bg-[#323d8f]/5 shadow-sm'
                                    : 'border-border hover:border-[#323d8f]/30 hover:bg-muted/30'
                                }`}
                            onClick={() => onToggleType(type.value as QuestionType)}
                        >
                            <CardContent className="flex min-h-12 items-center gap-2.5 p-2.5">
                                <Checkbox
                                    id={type.value}
                                    checked={selectedTypes.has(type.value as QuestionType)}
                                    onCheckedChange={() => onToggleType(type.value as QuestionType)}
                                    className="data-[state=checked]:bg-[#323d8f] data-[state=checked]:border-[#323d8f]"
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
                                    <Badge
                                        variant="secondary"
                                        className="h-5 shrink-0 rounded-md bg-[#323d8f] px-1.5 text-[10px] text-white"
                                    >
                                        {selectedType.count}
                                    </Badge>
                                ) : null}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

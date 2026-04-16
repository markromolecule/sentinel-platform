'use client';

import { ScrollArea, Badge, Input } from '@sentinel/ui';
import { QUESTION_TYPE_OPTIONS } from '@sentinel/shared/constants';
import type { QuestionType } from '@sentinel/shared/types';
import type { QuestionTypeDistributionItem } from '../../_types';

interface SelectedMixListProps {
    questionTypeDistribution: QuestionTypeDistributionItem[];
    onTypeCountChange: (type: QuestionType, count: number) => void;
}

export function SelectedMixList({
    questionTypeDistribution,
    onTypeCountChange,
}: SelectedMixListProps) {
    return (
        <div className="bg-background flex min-h-[320px] flex-col rounded-xl border">
            <div className="border-b px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-medium">Selected mix</h3>
                        <p className="text-muted-foreground text-xs">
                            Adjust the count for each selected type.
                        </p>
                    </div>
                    <Badge variant="outline" className="h-5 shrink-0 rounded-md px-1.5 text-[10px]">
                        {questionTypeDistribution.length} selected
                    </Badge>
                </div>
            </div>

            {questionTypeDistribution.length > 0 ? (
                <ScrollArea className="h-[320px]">
                    <div className="space-y-2.5 p-3">
                        {questionTypeDistribution.map((item) => {
                            const option = QUESTION_TYPE_OPTIONS.find(
                                (questionType) => questionType.value === item.type,
                            );

                            return (
                                <div
                                    key={item.type}
                                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">
                                            {option?.label ?? item.type}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            Included in the final generated set
                                        </p>
                                    </div>
                                    <div className="w-20 shrink-0">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={100}
                                            className="h-8 px-2 text-sm"
                                            value={item.count}
                                            onChange={(event) =>
                                                onTypeCountChange(
                                                    item.type,
                                                    Number.parseInt(event.target.value, 10) || 0,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex h-[320px] items-center justify-center p-6 text-center">
                    <div className="max-w-[240px] space-y-2">
                        <p className="text-sm font-medium">No types selected yet</p>
                        <p className="text-muted-foreground text-xs">
                            Pick one or more question types on the left. Their counts will appear
                            here without stretching the dialog.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

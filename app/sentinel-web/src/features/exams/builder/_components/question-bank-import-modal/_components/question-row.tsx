'use client';

import { memo } from 'react';
import { Badge, Checkbox, cn } from '@sentinel/ui';
import { ChevronRight } from 'lucide-react';
import type { QuestionRecord } from '@sentinel/services';
import { getQuestionPrompt } from '../utils';

interface QuestionRowProps {
    question: QuestionRecord;
    selected: boolean;
    isAlreadyAdded?: boolean;
    onToggle: () => void;
}

export const QuestionRow = memo(function QuestionRow({
    question,
    selected,
    isAlreadyAdded = false,
    onToggle,
}: QuestionRowProps) {
    return (
        <div
            className={cn(
                'group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all',
                selected
                    ? 'border-primary/20 bg-primary/[0.03]'
                    : 'bg-background hover:border-border hover:bg-muted/20',
                isAlreadyAdded && 'cursor-default',
            )}
            onClick={() => {
                if (!isAlreadyAdded) {
                    onToggle();
                }
            }}
        >
            <div className="pt-0.5">
                <Checkbox
                    checked={selected}
                    onCheckedChange={() => undefined}
                    className="pointer-events-none h-4 w-4 rounded-md data-[state=checked]:bg-primary"
                />
            </div>
            <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="secondary"
                            className="border-none bg-muted px-1.5 py-0 text-[10px] font-medium tracking-normal text-muted-foreground"
                        >
                            {question.type.replaceAll('_', ' ')}
                        </Badge>
                        {isAlreadyAdded ? (
                            <Badge
                                variant="secondary"
                                className="border-none bg-primary/10 px-1.5 py-0 text-[10px] font-medium tracking-normal text-primary"
                            >
                                Already in exam
                            </Badge>
                        ) : null}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                        {question.points} Pts
                    </span>
                </div>
                <p className="pr-6 text-sm leading-6 font-medium text-foreground">
                    {getQuestionPrompt(question)}
                </p>
                {question.tags && question.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                        {question.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
            <div className="self-center">
                <ChevronRight
                    className={cn(
                        'h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100',
                        selected ? 'translate-x-0 text-primary opacity-100' : 'text-muted-foreground',
                    )}
                />
            </div>
        </div>
    );
});

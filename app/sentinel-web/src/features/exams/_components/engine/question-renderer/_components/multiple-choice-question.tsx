
import { CircleOff, Check } from 'lucide-react';
import { cn } from '@sentinel/ui';
import type { ExamQuestionRendererProps } from '../../types';

export function MultipleChoiceQuestion({
    question,
    value,
    onChange,
    showCorrectAnswer,
    crossOutEnabled = false,
    crossedOutOptions = [],
    onToggleOptionCrossOut,
}: ExamQuestionRendererProps) {
    const options = question.content.options ?? [];

    return (
        <div className="grid gap-3">
            {options.map((option, index) => {
                const isSelected = value === index;
                const isCorrect =
                    showCorrectAnswer &&
                    (question.content.correctAnswer === index ||
                        (typeof question.content.correctAnswer === 'string' &&
                            option === question.content.correctAnswer));
                const isCrossedOut = crossedOutOptions.includes(index);

                return (
                    <div
                        key={`${question.id}:${index}`}
                        className={cn(
                            'grid gap-2',
                            crossOutEnabled ? 'md:grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-1',
                        )}
                    >
                        <button
                            onClick={() => onChange(index)}
                            className={cn(
                                'flex items-center justify-between border px-4 py-4 text-left transition',
                                isSelected
                                    ? 'border-primary/40 bg-primary/5'
                                    : 'border-border/60 bg-background hover:border-primary/20 hover:bg-muted/20',
                                isCrossedOut ? 'text-muted-foreground border-dashed opacity-60' : '',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'flex min-w-10 items-center justify-center text-sm font-semibold',
                                        isSelected
                                            ? 'text-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {String.fromCharCode(65 + index)}.
                                </span>
                                <span
                                    className={cn(
                                        'text-sm font-medium leading-6',
                                        isCrossedOut ? 'line-through' : '',
                                    )}
                                >
                                    {option}
                                </span>
                            </div>

                            {isCorrect ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                            ) : null}
                        </button>

                        {crossOutEnabled ? (
                            <button
                                type="button"
                                onClick={() => onToggleOptionCrossOut?.(index)}
                                className={cn(
                                    'border-border/60 text-muted-foreground hover:text-foreground flex h-full min-h-14 items-center justify-center border bg-background px-4 transition',
                                    isCrossedOut
                                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                                        : 'hover:bg-muted/20',
                                )}
                                aria-pressed={isCrossedOut}
                                aria-label={
                                    isCrossedOut
                                        ? `Restore option ${String.fromCharCode(65 + index)}`
                                        : `Cross out option ${String.fromCharCode(65 + index)}`
                                }
                            >
                                <CircleOff className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

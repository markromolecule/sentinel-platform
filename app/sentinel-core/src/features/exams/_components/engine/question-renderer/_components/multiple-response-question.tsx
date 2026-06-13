import { CircleOff, Check } from 'lucide-react';
import { Badge, cn } from '@sentinel/ui';
import type { ExamQuestionRendererProps } from '../../types';

export function MultipleResponseQuestion({
    question,
    value,
    onChange,
    showCorrectAnswer,
    crossOutEnabled = false,
    crossedOutOptions = [],
    onToggleOptionCrossOut,
}: ExamQuestionRendererProps) {
    const options = question.content.options ?? [];
    const selectedValues = Array.isArray(value)
        ? value.filter((item): item is number => typeof item === 'number')
        : [];
    const correctValues = Array.isArray(question.content.correctAnswer)
        ? question.content.correctAnswer
        : [];

    const isOptionCorrect = (optionIndex: number) => {
        if (!showCorrectAnswer) return false;
        const optionText = options[optionIndex];
        return correctValues.some(
            (correct) =>
                correct === optionIndex || (typeof correct === 'string' && correct === optionText),
        );
    };

    const toggleOption = (optionIndex: number) => {
        if (selectedValues.includes(optionIndex)) {
            onChange(selectedValues.filter((item) => item !== optionIndex));
            return;
        }

        onChange([...selectedValues, optionIndex]);
    };

    return (
        <div className="grid gap-3">
            {options.map((option, index) => {
                const isSelected = selectedValues.includes(index);
                const isCorrect = isOptionCorrect(index);
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
                            onClick={() => toggleOption(index)}
                            className={cn(
                                'flex items-center justify-between border px-4 py-4 text-left transition',
                                isSelected
                                    ? 'border-primary/40 bg-primary/5'
                                    : 'border-border/60 bg-background hover:border-primary/20 hover:bg-muted/20',
                                isCrossedOut
                                    ? 'text-muted-foreground border-dashed opacity-60'
                                    : '',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'flex h-4 w-4 items-center justify-center border',
                                        isSelected
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border/60 bg-background',
                                        isCrossedOut ? 'border-dashed' : '',
                                    )}
                                >
                                    {isSelected ? <Check className="h-3 w-3" /> : null}
                                </span>
                                <span
                                    className={cn(
                                        'text-sm leading-6 font-medium',
                                        isCrossedOut ? 'line-through' : '',
                                    )}
                                >
                                    {option}
                                </span>
                            </div>

                            {isCorrect ? (
                                <Badge className="rounded-md bg-emerald-500 text-white hover:bg-emerald-500">
                                    Correct
                                </Badge>
                            ) : null}
                        </button>

                        {crossOutEnabled ? (
                            <button
                                type="button"
                                onClick={() => onToggleOptionCrossOut?.(index)}
                                className={cn(
                                    'border-border/60 text-muted-foreground hover:text-foreground bg-background flex h-full min-h-14 items-center justify-center border px-4 transition',
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

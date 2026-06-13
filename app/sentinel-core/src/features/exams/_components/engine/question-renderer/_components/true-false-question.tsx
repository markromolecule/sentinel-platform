import { Check } from 'lucide-react';
import { Button, cn } from '@sentinel/ui';
import type { ExamQuestionRendererProps } from '../../types';

export function TrueFalseQuestion({
    value,
    onChange,
    showCorrectAnswer,
    question,
}: ExamQuestionRendererProps) {
    const correctBoolean =
        typeof question.content.correctAnswer === 'boolean'
            ? question.content.correctAnswer
            : question.content.correctBoolean;

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {[true, false].map((option) => {
                const isSelected = value === option;
                const isCorrect = showCorrectAnswer && correctBoolean === option;

                return (
                    <Button
                        key={option ? 'true' : 'false'}
                        variant="outline"
                        className={cn(
                            'h-auto min-h-14 justify-between border px-4 py-4 text-left text-sm font-semibold',
                            isCorrect
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-50'
                                : '',
                            isSelected
                                ? 'border-primary/40 bg-primary/5 text-foreground'
                                : 'border-border/60 bg-background hover:bg-muted/20',
                        )}
                        onClick={() => onChange(option)}
                    >
                        <span>{option ? 'True' : 'False'}</span>
                        {isCorrect ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                    </Button>
                );
            })}
        </div>
    );
}

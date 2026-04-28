
import { Input } from '@sentinel/ui';
import type { ExamQuestionRendererProps } from '../../types';

export function MatchingQuestion({
    question,
    value,
    onChange,
    showCorrectAnswer,
}: ExamQuestionRendererProps) {
    const pairs = question.content.pairs ?? [];
    const values =
        typeof value === 'object' && value !== null && !Array.isArray(value)
            ? (value as Record<string, string>)
            : {};

    const updatePair = (left: string, right: string) => {
        onChange({
            ...values,
            [left]: right,
        });
    };

    return (
        <div className="grid gap-3">
            {pairs.map((pair, index) => (
                <div
                    key={`${question.id}:pair:${index}`}
                    className="border-border/60 grid gap-3 border px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                >
                    <div>
                        <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                            Prompt
                        </p>
                        <p className="mt-2 text-sm font-medium">{pair.left}</p>
                    </div>
                    <label className="space-y-2">
                        <span className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                            Match
                        </span>
                        <Input
                            value={String(values[pair.left] ?? '')}
                            onChange={(event) => updatePair(pair.left, event.target.value)}
                            placeholder={pair.right}
                            className="h-12 rounded-md"
                        />
                        {showCorrectAnswer && pair.right ? (
                            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                                <span className="font-semibold">Correct match:</span> {pair.right}
                            </div>
                        ) : null}
                    </label>
                </div>
            ))}
        </div>
    );
}

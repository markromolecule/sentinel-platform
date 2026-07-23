import { Input } from '@sentinel/ui';
import type { ExamQuestionRendererProps } from '../../types';

export function IdentificationQuestion({
    question,
    value,
    onChange,
    showCorrectAnswer,
}: ExamQuestionRendererProps) {
    const answerPreview =
        (question.content.correctAnswer as string | undefined) ??
        question.content.acceptedAnswers?.[0] ??
        'No answer key provided.';

    const inputId = `id-input-${question.id}`;

    return (
        <div className="space-y-4">
            <label htmlFor={inputId} className="sr-only">
                {question.content.prompt}
            </label>
            <Input
                id={inputId}
                value={(value as string) ?? ''}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Type the response here..."
                className="h-12 rounded-md"
            />
            {showCorrectAnswer ? (
                <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                    <span className="font-semibold">Instructor answer key:</span> {answerPreview}
                </div>
            ) : null}
        </div>
    );
}

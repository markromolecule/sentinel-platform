import { Textarea } from '@sentinel/ui';
import type { ExamQuestionRendererProps } from '../../types';

export function EssayQuestion({ question, value, onChange }: ExamQuestionRendererProps) {
    const textareaId = `essay-textarea-${question.id}`;

    return (
        <div className="relative">
            <label htmlFor={textareaId} className="sr-only">
                {question.content.prompt}
            </label>
            <Textarea
                id={textareaId}
                value={(value as string) ?? ''}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Essay response..."
                className="min-h-[180px] rounded-md"
            />
        </div>
    );
}

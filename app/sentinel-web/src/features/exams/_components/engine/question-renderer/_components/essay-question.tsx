import { Textarea } from '@sentinel/ui';
import type { ExamQuestionRendererProps } from '../../types';

export function EssayQuestion({ value, onChange }: ExamQuestionRendererProps) {
    return (
        <Textarea
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Essay response..."
            className="min-h-[180px] rounded-md"
        />
    );
}

'use client';

import { Button, Input, Label, Checkbox } from '@sentinel/ui';
import { Plus, Trash2 } from 'lucide-react';
import type { ExamQuestionContent, QuestionType } from '@sentinel/shared/types';

interface IdentificationFormProps {
    type: QuestionType;
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
}

export function IdentificationForm({ type, content, onChange }: IdentificationFormProps) {
    const acceptedAnswers = content.acceptedAnswers ?? [''];

    const handleAddAnswer = () => {
        onChange({
            ...content,
            acceptedAnswers: [...acceptedAnswers, ''],
        });
    };

    const handleRemoveAnswer = (index: number) => {
        onChange({
            ...content,
            acceptedAnswers: acceptedAnswers.filter((_, i) => i !== index),
        });
    };

    const handleAnswerChange = (index: number, value: string) => {
        const nextAnswers = [...acceptedAnswers];
        nextAnswers[index] = value;
        onChange({
            ...content,
            acceptedAnswers: nextAnswers,
        });
    };

    return (
        <div className="border-border/60 space-y-4 border-t pt-6">
            <Label className="text-sm font-medium">
                {type === 'IDENTIFICATION' ? 'Accepted Answers' : 'Enumerated Items'}
            </Label>
            <div className="space-y-3">
                {acceptedAnswers.map((answer, idx) => (
                    <div key={idx} className="group flex gap-3">
                        <div className="relative flex-1">
                            <Input
                                placeholder={
                                    type === 'IDENTIFICATION'
                                        ? 'Enter correct alternative...'
                                        : `Item ${idx + 1}`
                                }
                                value={answer}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            />
                            {idx > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                                    onClick={() => handleRemoveAnswer(idx)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Button variant="outline" className="w-full border-dashed" onClick={handleAddAnswer}>
                <Plus className="h-4 w-4" /> Add{' '}
                {type === 'IDENTIFICATION' ? 'Alternative' : 'Item'}
            </Button>
            {type === 'IDENTIFICATION' && (
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="case-sensitive"
                        checked={content.caseSensitive ?? false}
                        onCheckedChange={(checked) =>
                            onChange({ ...content, caseSensitive: checked === true })
                        }
                    />
                    <Label
                        htmlFor="case-sensitive"
                        className="cursor-pointer text-sm leading-none font-medium"
                    >
                        Case Sensitive
                    </Label>
                </div>
            )}
        </div>
    );
}

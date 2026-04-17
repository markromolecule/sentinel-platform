'use client';

import { Check, CircleOff } from 'lucide-react';
import { Badge, Button, Input, Textarea, cn } from '@sentinel/ui';

import type { ExamQuestionRendererProps } from '../types';
import {
    getQuestionPrompt,
} from '../utils';

function MultipleChoiceQuestion({
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
                const isCorrect = showCorrectAnswer && question.content.correctAnswer === index;
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

function MultipleResponseQuestion({
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
        ? question.content.correctAnswer.filter(
              (item): item is number => typeof item === 'number',
          )
        : [];

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
                const isCorrect = showCorrectAnswer && correctValues.includes(index);
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
                                isCrossedOut ? 'text-muted-foreground border-dashed opacity-60' : '',
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
                                        'text-sm font-medium leading-6',
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

function TrueFalseQuestion({
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

function IdentificationQuestion({
    question,
    value,
    onChange,
    showCorrectAnswer,
}: ExamQuestionRendererProps) {
    const answerPreview =
        (question.content.correctAnswer as string | undefined) ??
        question.content.acceptedAnswers?.[0] ??
        'No answer key provided.';

    return (
        <div className="space-y-4">
            <Input
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

function EssayQuestion({ value, onChange }: ExamQuestionRendererProps) {
    return (
        <Textarea
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Essay response..."
            className="min-h-[180px] rounded-md"
        />
    );
}

function FillBlankQuestion({ question, value, onChange, showCorrectAnswer }: ExamQuestionRendererProps) {
    const blanks = question.content.blanks ?? [];
    const values = Array.isArray(value) ? value : blanks.map(() => '');

    const updateBlank = (index: number, nextValue: string) => {
        const nextValues = [...values];
        nextValues[index] = nextValue;
        onChange(nextValues);
    };

    return (
        <div className="grid gap-3">
            {blanks.length ? (
                blanks.map((blank, index) => (
                    <label key={`${question.id}:blank:${index}`} className="space-y-2">
                        <span className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Blank {index + 1}
                        </span>
                        <Input
                            value={(values[index] as string) ?? ''}
                            onChange={(event) => updateBlank(index, event.target.value)}
                            placeholder={blank || `Response ${index + 1}`}
                            className="h-12 rounded-md"
                        />
                        {showCorrectAnswer && blank ? (
                            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                                <span className="font-semibold">Answer key:</span> {blank}
                            </div>
                        ) : null}
                    </label>
                ))
            ) : (
                <div className="space-y-2">
                    <Input
                        value={(values[0] as string) ?? ''}
                        onChange={(event) => updateBlank(0, event.target.value)}
                        placeholder="Type the missing value..."
                        className="h-12 rounded-md"
                    />
                    {showCorrectAnswer && blanks[0] ? (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                            <span className="font-semibold">Answer key:</span> {blanks[0]}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

function MatchingQuestion({ question, value, onChange, showCorrectAnswer }: ExamQuestionRendererProps) {
    const pairs = question.content.pairs ?? [];
    const values = typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};

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

function EnumerationQuestion({ question, value, onChange, showCorrectAnswer }: ExamQuestionRendererProps) {
    const blanks = question.content.acceptedAnswers ?? question.content.blanks ?? ['', '', ''];
    const values = Array.isArray(value) ? value : blanks.map(() => '');

    const updateItem = (index: number, nextValue: string) => {
        const nextValues = [...values];
        nextValues[index] = nextValue;
        onChange(nextValues);
    };

    return (
        <div className="grid gap-3">
            {blanks.map((_, index) => (
                <div key={`${question.id}:enum:${index}`} className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center bg-muted/60 text-sm font-semibold">
                            {index + 1}
                        </span>
                        <Input
                            value={(values[index] as string) ?? ''}
                            onChange={(event) => updateItem(index, event.target.value)}
                            placeholder={`Item ${index + 1}`}
                            className="h-12 rounded-md"
                        />
                    </div>
                    {showCorrectAnswer && blanks[index] ? (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                            <span className="font-semibold">Accepted answer:</span> {blanks[index]}
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

function UnsupportedQuestion() {
    return (
        <div className="border-border/60 bg-muted/20 border border-dashed px-4 py-6 text-sm leading-6">
            This question type is not yet rendered in the shared attempt engine.
        </div>
    );
}

export function ExamQuestionRenderer({
    question,
    value,
    onChange,
    showCorrectAnswer = false,
    crossOutEnabled = false,
    crossedOutOptions = [],
    onToggleOptionCrossOut,
}: ExamQuestionRendererProps) {
    return (
        <div className="space-y-5">
            <div className="space-y-3">
                <h2 className="text-foreground text-xl font-semibold leading-8 sm:text-2xl">
                    {getQuestionPrompt(question)}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {question.points} point{question.points === 1 ? '' : 's'}
                </p>
            </div>

            {question.type === 'MULTIPLE_CHOICE' ? (
                <MultipleChoiceQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                    crossOutEnabled={crossOutEnabled}
                    crossedOutOptions={crossedOutOptions}
                    onToggleOptionCrossOut={onToggleOptionCrossOut}
                />
            ) : question.type === 'MULTIPLE_RESPONSE' ? (
                <MultipleResponseQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                    crossOutEnabled={crossOutEnabled}
                    crossedOutOptions={crossedOutOptions}
                    onToggleOptionCrossOut={onToggleOptionCrossOut}
                />
            ) : question.type === 'TRUE_FALSE' ? (
                <TrueFalseQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'IDENTIFICATION' ? (
                <IdentificationQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'ESSAY' ? (
                <EssayQuestion question={question} value={value} onChange={onChange} />
            ) : question.type === 'FILL_BLANK' ? (
                <FillBlankQuestion question={question} value={value} onChange={onChange} />
            ) : question.type === 'MATCHING' ? (
                <MatchingQuestion question={question} value={value} onChange={onChange} />
            ) : question.type === 'ENUMERATION' ? (
                <EnumerationQuestion question={question} value={value} onChange={onChange} />
            ) : (
                <UnsupportedQuestion />
            )}
        </div>
    );
}

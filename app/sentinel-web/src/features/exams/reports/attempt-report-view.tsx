'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
    AttemptGradingDetailType,
    GradingQuestionType,
    UpdateGradingAttemptBodyType,
} from '@sentinel/shared';
import { renderPassage } from '@sentinel/shared';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Textarea,
} from '@sentinel/ui';

type AttemptReportViewProps = {
    attempt: AttemptGradingDetailType;
    questions: GradingQuestionType[];
    editable?: boolean;
    isSubmitting?: boolean;
    onSubmit?: (payload: {
        itemOverrides: NonNullable<UpdateGradingAttemptBodyType['itemOverrides']>;
        finalize: boolean;
    }) => void;
};

function formatAnswerValue(value: unknown) {
    if (value === null || value === undefined) {
        return 'No response';
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>)
            .map(([key, entryValue]) => `${key}: ${String(entryValue)}`)
            .join(' | ');
    }

    return String(value);
}

function formatCorrectAnswer(value: unknown) {
    if (value === null || value === undefined) {
        return 'Instructor-scored response';
    }

    return formatAnswerValue(value);
}

function getQuestionPassage(question?: GradingQuestionType) {
    if (!question) {
        return null;
    }

    return renderPassage({
        sourceEvidence: question.sourceEvidence ?? null,
        passageContent: question.passageContent ?? null,
        passageType: question.passageType ?? null,
    });
}

/**
 * Renders a question-by-question exam attempt report and optionally exposes
 * override controls for instructor review workflows.
 */
export function AttemptReportView({
    attempt,
    questions,
    editable = false,
    isSubmitting = false,
    onSubmit,
}: AttemptReportViewProps) {
    const [overrideDrafts, setOverrideDrafts] = useState<
        Record<string, { awardedScore: string; reason: string }>
    >({});

    useEffect(() => {
        setOverrideDrafts(
            Object.fromEntries(
                Object.entries(attempt.itemOverrides ?? {}).map(([questionId, override]) => [
                    questionId,
                    {
                        awardedScore: String(override.awardedScore),
                        reason: override.reason ?? '',
                    },
                ]),
            ),
        );
    }, [attempt.itemOverrides]);

    const reportCards = useMemo(
        () =>
            attempt.questionReports.map((report) => {
                const question = questions.find((entry) => entry.id === report.questionId);

                return {
                    ...report,
                    question,
                };
            }),
        [attempt.questionReports, questions],
    );

    const handleOverrideChange = (questionId: string, field: 'awardedScore' | 'reason', value: string) => {
        setOverrideDrafts((prev) => ({
            ...prev,
            [questionId]: {
                awardedScore:
                    field === 'awardedScore' ? value : (prev[questionId]?.awardedScore ?? ''),
                reason: field === 'reason' ? value : (prev[questionId]?.reason ?? ''),
            },
        }));
    };

    const buildOverridePayload = () => {
        return Object.entries(overrideDrafts).reduce<
            NonNullable<UpdateGradingAttemptBodyType['itemOverrides']>
        >((acc, [questionId, override]) => {
            const awardedScore = Number(override.awardedScore);

            if (!Number.isFinite(awardedScore)) {
                return acc;
            }

            acc[questionId] = {
                awardedScore,
                reason: override.reason.trim() ? override.reason.trim() : null,
            };

            return acc;
        }, {});
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Final Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {attempt.score ?? 'N/A'} / {attempt.totalScore ?? 'N/A'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Finalization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant={attempt.grading.finalizedAt ? 'default' : 'secondary'}>
                            {attempt.grading.finalizedAt ? 'Finalized' : 'Draft'}
                        </Badge>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {attempt.grading.finalizedAt
                                ? `Locked at ${new Date(attempt.grading.finalizedAt).toLocaleString()}`
                                : 'Visible to students after finalization.'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Overall Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{attempt.feedback || 'No overall feedback recorded.'}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {reportCards.map((report, index) => {
                    const overrideDraft = overrideDrafts[report.questionId];

                    return (
                        <Card key={report.questionId}>
                            <CardHeader className="space-y-3">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                                            Question {index + 1}
                                        </p>
                                        <CardTitle className="mt-2 text-lg">
                                            {report.question?.content.prompt ?? report.prompt}
                                        </CardTitle>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">{report.questionType}</Badge>
                                        <Badge variant={report.isCorrect ? 'default' : 'secondary'}>
                                            {report.awardedScore ?? 0} / {report.maxScore} pts
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {(() => {
                                    const renderedPassage = getQuestionPassage(report.question);

                                    if (!renderedPassage) {
                                        return null;
                                    }

                                    return (
                                        <div className="space-y-3 rounded-xl border bg-slate-50/70 p-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                                                    Passage
                                                </p>
                                                <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                                                    <span>
                                                        {report.question?.sourceFileName ??
                                                            'No linked document'}
                                                    </span>
                                                    <span>
                                                        {report.question?.sourcePageNumber !== null &&
                                                        report.question?.sourcePageNumber !==
                                                            undefined
                                                            ? `Referenced page ${report.question.sourcePageNumber}`
                                                            : 'No page reference'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className="text-sm leading-7 [&_img]:max-h-64 [&_img]:w-auto [&_img]:rounded-md [&_img]:border sm:text-[15px]"
                                                dangerouslySetInnerHTML={{
                                                    __html: renderedPassage.html,
                                                }}
                                            />
                                        </div>
                                    );
                                })()}

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-muted-foreground text-xs font-semibold uppercase">
                                            Student Answer
                                        </p>
                                        <div className="bg-muted/30 rounded-lg border p-3 text-sm">
                                            {formatAnswerValue(report.answer)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-muted-foreground text-xs font-semibold uppercase">
                                            Correct Answer
                                        </p>
                                        <div className="bg-muted/30 rounded-lg border p-3 text-sm">
                                            {formatCorrectAnswer(report.correctAnswer)}
                                        </div>
                                    </div>
                                </div>

                                {report.evaluation ? (
                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                        {Object.entries(report.evaluation.scores ?? {}).map(
                                            ([criterion, value]) => (
                                                <div
                                                    key={criterion}
                                                    className="rounded-lg border bg-white p-3 text-sm"
                                                >
                                                    <p className="text-muted-foreground text-xs uppercase">
                                                        {criterion}
                                                    </p>
                                                    <p className="mt-2 text-lg font-semibold">{value}</p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : null}

                                {editable ? (
                                    <div className="grid gap-4 rounded-xl border border-dashed p-4 lg:grid-cols-[160px_minmax(0,1fr)]">
                                        <div className="space-y-2">
                                            <Label htmlFor={`override-score-${report.questionId}`}>
                                                Override Score
                                            </Label>
                                            <Input
                                                id={`override-score-${report.questionId}`}
                                                type="number"
                                                min={0}
                                                max={report.maxScore}
                                                step="0.1"
                                                value={overrideDraft?.awardedScore ?? ''}
                                                onChange={(event) =>
                                                    handleOverrideChange(
                                                        report.questionId,
                                                        'awardedScore',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder={String(report.awardedScore ?? 0)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`override-reason-${report.questionId}`}>
                                                Override Reason
                                            </Label>
                                            <Textarea
                                                id={`override-reason-${report.questionId}`}
                                                value={overrideDraft?.reason ?? ''}
                                                onChange={(event) =>
                                                    handleOverrideChange(
                                                        report.questionId,
                                                        'reason',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Explain why this score was adjusted."
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {editable && onSubmit ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={() =>
                            onSubmit({
                                itemOverrides: buildOverridePayload(),
                                finalize: false,
                            })
                        }
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Overrides'}
                    </Button>
                    <Button
                        onClick={() =>
                            onSubmit({
                                itemOverrides: buildOverridePayload(),
                                finalize: true,
                            })
                        }
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save & Finalize Report'}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

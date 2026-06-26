import { useMemo, useState } from 'react';
import type {
    AttemptGradingDetailType,
    GradingQuestionType,
    UpdateGradingAttemptBodyType,
} from '@sentinel/shared';
import {
    buildOverridePayload,
    normalizeOverrideDrafts,
    type AttemptReportOverrideDrafts,
} from './attempt-report-utils';
import { AttemptReportActions } from './_components/attempt-report-actions';
import { AttemptReportQuestionCard } from './_components/attempt-report-question-card';
import { AttemptReportSummaryCards } from './_components/attempt-report-summary-cards';

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
    const [overrideDrafts, setOverrideDrafts] = useState<AttemptReportOverrideDrafts>(() =>
        normalizeOverrideDrafts(attempt.itemOverrides),
    );

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

    const handleOverrideChange = (
        questionId: string,
        field: 'awardedScore' | 'reason',
        value: string,
    ) => {
        setOverrideDrafts((prev) => ({
            ...prev,
            [questionId]: {
                awardedScore:
                    field === 'awardedScore' ? value : (prev[questionId]?.awardedScore ?? ''),
                reason: field === 'reason' ? value : (prev[questionId]?.reason ?? ''),
            },
        }));
    };

    const handleSubmit = (finalize: boolean) => {
        if (!onSubmit) {
            return;
        }

        onSubmit({
            itemOverrides: buildOverridePayload(overrideDrafts),
            finalize,
        });
    };

    return (
        <div className="space-y-6">
            <AttemptReportSummaryCards attempt={attempt} />

            <div className="space-y-4">
                {reportCards.map((report, index) => (
                    <AttemptReportQuestionCard
                        key={report.questionId}
                        report={report}
                        index={index}
                        editable={editable}
                        overrideDraft={overrideDrafts[report.questionId]}
                        onOverrideChange={handleOverrideChange}
                    />
                ))}
            </div>

            <AttemptReportActions
                editable={editable}
                hasSubmitHandler={Boolean(onSubmit)}
                isSubmitting={isSubmitting}
                onSaveOverrides={() => handleSubmit(false)}
                onSaveAndFinalize={() => handleSubmit(true)}
            />
        </div>
    );
}

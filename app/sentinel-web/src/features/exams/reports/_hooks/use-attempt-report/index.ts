import { useEffect, useMemo, useState } from 'react';
import {
    buildOverridePayload,
    normalizeOverrideDrafts,
    type AttemptReportOverrideDrafts,
} from '../../attempt-report-utils';
import type { UseAttemptReportProps, UseAttemptReportReturn, ReportCardType } from './_types';

/**
 * Custom hook managing the state and logic for the exam attempt report.
 * Handles loading override drafts, selecting a report card, combining reports with question details,
 * and submitting the override scores/finalizing.
 *
 * @param props - Object containing the attempt, questions list, and onSubmit callback.
 * @returns The state and handler methods for attempt grading and overrides.
 */
export function useAttemptReport({
    attempt,
    questions,
    onSubmit,
}: UseAttemptReportProps): UseAttemptReportReturn {
    const [overrideDrafts, setOverrideDrafts] = useState<AttemptReportOverrideDrafts>(() =>
        normalizeOverrideDrafts(attempt.itemOverrides),
    );

    useEffect(() => {
        setOverrideDrafts(normalizeOverrideDrafts(attempt.itemOverrides));
    }, [attempt.itemOverrides]);

    const [selectedReport, setSelectedReport] = useState<ReportCardType | null>(null);

    const reportCards = useMemo<ReportCardType[]>(
        () =>
            attempt.questionReports.map((report) => {
                const question = questions.find((entry) => entry.id === report.questionId);
                const draft = overrideDrafts[report.questionId];

                let awardedScore = report.awardedScore;
                if (draft && draft.awardedScore !== '') {
                    const draftScore = Number(draft.awardedScore);
                    if (!Number.isNaN(draftScore)) {
                        awardedScore = draftScore;
                    }
                }

                return {
                    ...report,
                    awardedScore,
                    question,
                };
            }),
        [attempt.questionReports, questions, overrideDrafts],
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

    return {
        overrideDrafts,
        selectedReport,
        setSelectedReport,
        reportCards,
        handleOverrideChange,
        handleSubmit,
    };
}

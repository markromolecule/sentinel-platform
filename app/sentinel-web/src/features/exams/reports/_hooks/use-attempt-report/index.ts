import { useEffect, useMemo, useRef, useState } from 'react';
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
    isSaving = false,
}: UseAttemptReportProps): UseAttemptReportReturn {
    const [overrideDrafts, setOverrideDrafts] = useState<AttemptReportOverrideDrafts>(() =>
        normalizeOverrideDrafts(attempt.itemOverrides),
    );

    const prevIsSaving = useRef(isSaving);

    useEffect(() => {
        // Sync drafts from server ONLY when a save operation completes.
        // This prevents background refetches (focus, etc.) from wiping out active user edits.
        if (prevIsSaving.current && !isSaving) {
            setOverrideDrafts(normalizeOverrideDrafts(attempt.itemOverrides));
        }
        prevIsSaving.current = isSaving;
    }, [attempt.itemOverrides, isSaving]);

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

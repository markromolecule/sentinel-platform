'use client';

import { useState } from 'react';
import type { AttemptMonitoringPhase } from '@/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring';

export function useAttemptUIState() {
    const [reviewQuestionIds, setReviewQuestionIds] = useState<string[]>([]);
    const [showPassagePanel, setShowPassagePanel] = useState(true);
    const [isCompactPassageOpen, setIsCompactPassageOpen] = useState(false);
    const [crossOutEnabled, setCrossOutEnabled] = useState(false);
    const [crossedOutOptions, setCrossedOutOptions] = useState<Record<string, number[]>>({});
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
    const [isRedirectingToTurnIn, setIsRedirectingToTurnIn] = useState(false);
    const [monitoringPhase, setMonitoringPhase] = useState<AttemptMonitoringPhase>('active');

    const handleToggleReview = (questionId: string) => {
        setReviewQuestionIds((current) =>
            current.includes(questionId)
                ? current.filter((id) => id !== questionId)
                : [...current, questionId],
        );
    };

    const handleToggleCrossOutOption = (questionId: string, optionIndex: number) => {
        setCrossedOutOptions((current) => {
            const existing = current[questionId] ?? [];
            const next = existing.includes(optionIndex)
                ? existing.filter((i) => i !== optionIndex)
                : [...existing, optionIndex].sort((a, b) => a - b);
            return { ...current, [questionId]: next };
        });
    };

    return {
        reviewQuestionIds,
        setReviewQuestionIds,
        showPassagePanel,
        setShowPassagePanel,
        isCompactPassageOpen,
        setIsCompactPassageOpen,
        crossOutEnabled,
        setCrossOutEnabled,
        crossedOutOptions,
        isSubmitDialogOpen,
        setIsSubmitDialogOpen,
        isRedirectingToTurnIn,
        setIsRedirectingToTurnIn,
        monitoringPhase,
        setMonitoringPhase,
        handleToggleReview,
        handleToggleCrossOutOption,
    };
}

'use client';

import { useState } from 'react';

export function useAttemptUIState() {
    const [reviewQuestionIds, setReviewQuestionIds] = useState<string[]>([]);
    const [showPassagePanel, setShowPassagePanel] = useState(true);
    const [crossOutEnabled, setCrossOutEnabled] = useState(false);
    const [crossedOutOptions, setCrossedOutOptions] = useState<Record<string, number[]>>({});
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
    const [isRedirectingToTurnIn, setIsRedirectingToTurnIn] = useState(false);

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
        crossOutEnabled,
        setCrossOutEnabled,
        crossedOutOptions,
        isSubmitDialogOpen,
        setIsSubmitDialogOpen,
        isRedirectingToTurnIn,
        setIsRedirectingToTurnIn,
        handleToggleReview,
        handleToggleCrossOutOption,
    };
}

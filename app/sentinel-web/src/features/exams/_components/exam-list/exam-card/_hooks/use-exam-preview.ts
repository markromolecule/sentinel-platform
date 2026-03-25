"use client";

import { useState, useMemo } from "react";
import { Exam } from "@sentinel/shared/types";

import { AnswerValue } from "../_components/exam-preview-dialog/_types";

export type PreviewStep = "info" | "questions";
export type PreviewMode = "web" | "mobile";

export function useExamPreview(exam: Exam) {
    const [currentStep, setCurrentStep] = useState<PreviewStep>("info");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, AnswerValue>>({});
    const [previewMode, setPreviewMode] = useState<PreviewMode>("web");

    const questions = useMemo(() => exam.questions || [], [exam.questions]);
    const currentQuestion = questions[currentQuestionIndex];

    const handleStart = () => setCurrentStep("questions");

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleAnswerChange = (questionId: string, answer: AnswerValue) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const resetPreview = () => {
        setCurrentStep("info");
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
    };

    const progress = questions.length > 0 
        ? ((currentQuestionIndex + 1) / questions.length) * 100 
        : 0;

    return {
        currentStep,
        setCurrentStep,
        currentQuestionIndex,
        currentQuestion,
        questions,
        selectedAnswers,
        previewMode,
        setPreviewMode,
        handleStart,
        handleNext,
        handlePrevious,
        handleAnswerChange,
        resetPreview,
        progress
    };
}

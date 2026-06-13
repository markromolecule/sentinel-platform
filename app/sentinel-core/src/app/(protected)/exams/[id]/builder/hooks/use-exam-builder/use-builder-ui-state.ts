import { useState } from 'react';
import { type QuestionType, type ExamQuestion } from '@sentinel/shared/types';
import { type QuestionTypeDefinition } from '@sentinel/services';

interface UseBuilderUIStateProps {
    questionTypes: QuestionTypeDefinition[];
}

export function useBuilderUIState({ questionTypes }: UseBuilderUIStateProps) {
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [activeQuestionType, setActiveQuestionType] = useState<QuestionType | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);

    const activeQuestionTypeDefinition = questionTypes.find(
        (questionType) => questionType.value === activeQuestionType,
    );

    const handleSelectQuestionType = (type: QuestionType) => {
        setEditingQuestion(null);
        setIsTypeSelectorOpen(false);
        setActiveQuestionType(type);
    };

    const handleBackFromBuilder = () => {
        setActiveQuestionType(null);
        setEditingQuestion(null);
    };

    return {
        isTypeSelectorOpen,
        activeQuestionType,
        editingQuestion,
        activeQuestionTypeDefinition,
        setIsTypeSelectorOpen,
        setActiveQuestionType,
        setEditingQuestion,
        handleSelectQuestionType,
        handleBackFromBuilder,
    };
}

'use client';

import { useState } from 'react';
import type { QuestionType } from '@sentinel/shared/types';
import type { QuestionTypeDistributionItem } from '../_types';
import { DEFAULT_TYPE_COUNT, MAX_TOTAL_QUESTION_COUNT } from './constants';

export function useTypeDistribution() {
    const [questionTypeDistribution, setQuestionTypeDistribution] = useState<
        QuestionTypeDistributionItem[]
    >([
        {
            type: 'MULTIPLE_CHOICE',
            count: DEFAULT_TYPE_COUNT,
        },
    ]);

    const questionCount = questionTypeDistribution.reduce((total, item) => total + item.count, 0);

    const handleToggleType = (type: QuestionType) => {
        setQuestionTypeDistribution((currentDistribution) => {
            const existingType = currentDistribution.find((item) => item.type === type);

            if (existingType) {
                return currentDistribution.filter((item) => item.type !== type);
            }

            return [
                ...currentDistribution,
                {
                    type,
                    count: Math.min(DEFAULT_TYPE_COUNT, MAX_TOTAL_QUESTION_COUNT),
                },
            ];
        });
    };

    const handleTypeCountChange = (type: QuestionType, count: number) => {
        setQuestionTypeDistribution((currentDistribution) =>
            currentDistribution.map((item) =>
                item.type === type
                    ? {
                          ...item,
                          count: Math.max(1, Math.min(MAX_TOTAL_QUESTION_COUNT, count || 0)),
                      }
                    : item,
            ),
        );
    };

    return {
        questionTypeDistribution,
        questionCount,
        handleToggleType,
        handleTypeCountChange,
    };
}

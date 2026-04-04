import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { GenerateQuestionPreviewResponse } from '@sentinel/shared';
import { apiClient } from '@/data/api/client';
import type { QuestionTypeDistributionItem } from '../../_types';

export type GenerateQuestionsInput = {
    files: File[];
    questionCount: number;
    questionTypeDistribution: QuestionTypeDistributionItem[];
};

export type UseGenerateQuestionsMutationArgs = MutationOptions<
    GenerateQuestionPreviewResponse,
    Error,
    GenerateQuestionsInput
>;

export function useGenerateQuestionsMutation(args: UseGenerateQuestionsMutationArgs = {}) {
    return useMutation({
        ...args,
        mutationFn: async ({
            files,
            questionCount,
            questionTypeDistribution,
        }: GenerateQuestionsInput) => {
            const formData = new FormData();

            files.forEach((file: File) => {
                formData.append('file', file);
            });

            const config = {
                questionCount,
                questionTypeDistribution,
                target: 'QUESTION_BANK',
            };
            formData.append('config', JSON.stringify(config));

            const response = await apiClient('/ai/generate-preview', {
                method: 'POST',
                body: formData,
            });

            if (!response.data) {
                throw new Error(response.error || 'Failed to generate questions');
            }

            return response.data;
        },
    });
}

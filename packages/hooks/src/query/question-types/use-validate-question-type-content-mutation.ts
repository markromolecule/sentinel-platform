import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
    validateQuestionTypeContent,
    type QuestionTypeValidationResult,
    type ValidateQuestionTypeContentPayload,
} from '@sentinel/services';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseValidateQuestionTypeContentMutationArgs = UseMutationOptions<
    QuestionTypeValidationResult,
    Error,
    ValidateQuestionTypeContentPayload
>;

export function useValidateQuestionTypeContentMutation(
    args: UseValidateQuestionTypeContentMutationArgs = {
        onError: (error: Error) =>
            toast.error(error.message || 'Question content validation failed.'),
    },
) {
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => validateQuestionTypeContent(apiClient, payload),
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}

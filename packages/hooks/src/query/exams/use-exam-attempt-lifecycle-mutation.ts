import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    closeExamAttemptLifecycle,
    grantMakeupExamWindowLifecycle,
    grantRetakeExamWindowLifecycle,
    lockExamAttemptLifecycle,
    reopenExamAttemptLifecycle,
    resetExamAttemptLifecycle,
    type CloseExamAttemptLifecyclePayload,
    type GrantMakeupExamWindowPayload,
    type GrantRetakeExamWindowPayload,
    type LockExamAttemptLifecyclePayload,
    type ReopenExamAttemptLifecyclePayload,
    type ResetExamAttemptLifecyclePayload,
} from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import type { ExamAttemptLifecycleResponseType } from '@sentinel/shared';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

type LifecycleMutationBasePayload = { id: string; attemptId?: string; studentId?: string };

async function invalidateMonitoringQueries(
    queryClient: ReturnType<typeof useQueryClient>,
    variables: LifecycleMutationBasePayload,
) {
    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: EXAM_QUERY_KEYS.monitoring(variables.id),
        }),
        variables.studentId
            ? queryClient.invalidateQueries({
                  queryKey: EXAM_QUERY_KEYS.monitoringStudent(variables.id, variables.studentId),
              })
            : Promise.resolve(),
    ]);
}

export type UseLockExamAttemptMutationArgs = UseMutationOptions<
    ExamAttemptLifecycleResponseType,
    Error,
    LockExamAttemptLifecyclePayload
>;

export type UseReopenExamAttemptMutationArgs = UseMutationOptions<
    ExamAttemptLifecycleResponseType,
    Error,
    ReopenExamAttemptLifecyclePayload
>;

export type UseResetExamAttemptMutationArgs = UseMutationOptions<
    ExamAttemptLifecycleResponseType,
    Error,
    ResetExamAttemptLifecyclePayload
>;

export type UseCloseExamAttemptMutationArgs = UseMutationOptions<
    ExamAttemptLifecycleResponseType,
    Error,
    CloseExamAttemptLifecyclePayload
>;

export type UseGrantMakeupExamWindowMutationArgs = UseMutationOptions<
    { override: any; latestEvent: ExamAttemptLifecycleResponseType['latestEvent'] | null },
    Error,
    GrantMakeupExamWindowPayload
>;

export type UseGrantRetakeExamWindowMutationArgs = UseMutationOptions<
    { override: any; latestEvent: ExamAttemptLifecycleResponseType['latestEvent'] },
    Error,
    GrantRetakeExamWindowPayload
>;

function createLifecycleMutationOptions<TData, TVariables extends LifecycleMutationBasePayload>({
    mutationFn,
    successMessage,
    args,
}: {
    mutationFn: (apiClient: ReturnType<typeof useApi>, variables: TVariables) => Promise<TData>;
    successMessage: string;
    args?: UseMutationOptions<TData, Error, TVariables>;
}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (variables: TVariables) => mutationFn(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await invalidateMonitoringQueries(queryClient, variables);
            if (variables.attemptId && !variables.studentId) {
                await queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.all,
                });
            }
            toast.success(successMessage);
            (args?.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            toast.error(error.message);
            (args?.onError as any)?.(error, variables, context);
        },
    });
}

/**
 * Runs lock-attempt lifecycle mutations for monitoring surfaces.
 */
export function useLockExamAttemptMutation(args?: UseLockExamAttemptMutationArgs) {
    return createLifecycleMutationOptions({
        mutationFn: lockExamAttemptLifecycle,
        successMessage: 'Attempt locked successfully.',
        args,
    });
}

/**
 * Runs reopen-attempt lifecycle mutations for monitoring surfaces.
 */
export function useReopenExamAttemptMutation(args?: UseReopenExamAttemptMutationArgs) {
    return createLifecycleMutationOptions({
        mutationFn: reopenExamAttemptLifecycle,
        successMessage: 'Attempt reopened successfully.',
        args,
    });
}

/**
 * Runs reset-attempt lifecycle mutations for monitoring surfaces.
 */
export function useResetExamAttemptMutation(args?: UseResetExamAttemptMutationArgs) {
    return createLifecycleMutationOptions({
        mutationFn: resetExamAttemptLifecycle,
        successMessage: 'Attempt reset successfully.',
        args,
    });
}

/**
 * Runs close-attempt lifecycle mutations for monitoring surfaces.
 */
export function useCloseExamAttemptMutation(args?: UseCloseExamAttemptMutationArgs) {
    return createLifecycleMutationOptions({
        mutationFn: closeExamAttemptLifecycle,
        successMessage: 'Attempt closed successfully.',
        args,
    });
}

/**
 * Grants a makeup window through the lifecycle API for monitoring surfaces.
 */
export function useGrantMakeupExamWindowMutation(args?: UseGrantMakeupExamWindowMutationArgs) {
    return createLifecycleMutationOptions({
        mutationFn: grantMakeupExamWindowLifecycle,
        successMessage: 'Makeup window granted successfully.',
        args,
    });
}

/**
 * Grants a retake window through the lifecycle API for monitoring surfaces.
 */
export function useGrantRetakeExamWindowMutation(args?: UseGrantRetakeExamWindowMutationArgs) {
    return createLifecycleMutationOptions({
        mutationFn: grantRetakeExamWindowLifecycle,
        successMessage: 'Retake window granted successfully.',
        args,
    });
}

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createSubjectOfferingsFromClassification } from '@sentinel/services';
import type { ClassificationSubjectOfferingFormValues } from '@sentinel/shared/schema';
import type { ClassificationSubjectOfferingResult } from '@sentinel/shared/types';
import {
    SUBJECT_CLASSIFICATION_QUERY_KEYS,
    SUBJECT_OFFERING_QUERY_KEYS,
} from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseCreateSubjectOfferingsFromClassificationMutationArgs = UseMutationOptions<
    ClassificationSubjectOfferingResult,
    Error,
    ClassificationSubjectOfferingFormValues
>;

export function useCreateSubjectOfferingsFromClassificationMutation(
    args: UseCreateSubjectOfferingsFromClassificationMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createSubjectOfferingsFromClassification(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all }),
                queryClient.invalidateQueries({
                    queryKey: SUBJECT_CLASSIFICATION_QUERY_KEYS.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: SUBJECT_CLASSIFICATION_QUERY_KEYS.details(
                        variables.subject_classification_id,
                    ),
                }),
            ]);

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            const skippedMessage =
                data.skippedCount > 0 ? ` ${data.skippedCount} already existed.` : '';
            toast.success(
                `${data.createdCount} subject offering${
                    data.createdCount === 1 ? '' : 's'
                } created.${skippedMessage}`,
            );
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'subject offerings',
                action: 'offer',
                actionLabel: 'offer subjects',
                permissionKey: 'subject_offerings:offer',
            });
        },
    });
}

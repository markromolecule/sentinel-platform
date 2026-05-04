import {
    useMutation,
    useQueryClient,
    type UseMutationResult,
    type UseMutationOptions,
} from '@tanstack/react-query';
import { type Section } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { createBulkSections } from '@sentinel/services';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

type CreateSectionsPayload = {
    department_id?: string | null;
    course_id?: string | null;
    institution_id?: string | null;
    sections: {
        name: string;
        year_level?: number;
    }[];
};

type CreateSectionsVariables = {
    payload: CreateSectionsPayload;
};

export type UseCreateSectionsMutationArgs = UseMutationOptions<
    Section[],
    Error,
    CreateSectionsVariables
>;

export function useCreateSectionsMutation(
    options?: UseCreateSectionsMutationArgs,
): UseMutationResult<Section[], Error, CreateSectionsVariables> {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ payload }) => {
            return await createBulkSections(apiClient, payload);
        },
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SECTION_QUERY_KEYS.all });

            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Sections created successfully');
        },
        onError: (error, variables, context) => {
            if (options?.onError) {
                (options.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'sections',
                action: 'create',
                permissionKey: 'sections:create',
            });
        },
    });
}

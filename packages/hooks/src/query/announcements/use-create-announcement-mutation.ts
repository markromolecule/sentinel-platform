import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    createAnnouncement,
    type CreateAnnouncementDto,
    type Announcement,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseCreateAnnouncementMutationArgs = UseMutationOptions<
    Announcement,
    Error,
    CreateAnnouncementDto
>;

/**
 * Hook to create a new announcement.
 *
 * @param args Optional mutation options.
 */
export function useCreateAnnouncementMutation(args: UseCreateAnnouncementMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createAnnouncement(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ['announcements'] });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Announcement created successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'announcements',
                action: 'create',
                permissionKey: 'announcement:create',
            });
        },
    });
}

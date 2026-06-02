import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteAnnouncement } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteAnnouncementMutationArgs = UseMutationOptions<void, Error, string>;

/**
 * Hook to soft-delete an announcement.
 *
 * @param args Optional mutation options.
 */
export function useDeleteAnnouncementMutation(args: UseDeleteAnnouncementMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteAnnouncement(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ['announcements'] });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Announcement deleted successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'announcements',
                action: 'delete',
                permissionKey: 'announcement:delete',
            });
        },
    });
}

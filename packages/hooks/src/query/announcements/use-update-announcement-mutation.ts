import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    updateAnnouncement,
    type UpdateAnnouncementDto,
    type Announcement,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseUpdateAnnouncementMutationArgs = UseMutationOptions<
    Announcement,
    Error,
    { id: string; payload: UpdateAnnouncementDto }
>;

/**
 * Hook to update an existing announcement.
 *
 * @param args Optional mutation options.
 */
export function useUpdateAnnouncementMutation(args: UseUpdateAnnouncementMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: ({ id, payload }) => updateAnnouncement(apiClient, { id, payload }),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ['announcements'] });
            await queryClient.invalidateQueries({ queryKey: ['announcements', variables.id] });
            if (data.slug) {
                await queryClient.invalidateQueries({
                    queryKey: ['announcements', 'slug', data.slug],
                });
            }
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Announcement updated successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'announcements',
                action: 'update',
                permissionKey: 'announcement:update',
            });
        },
    });
}

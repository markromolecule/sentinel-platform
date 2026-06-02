import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';
import {
    getAnnouncements,
    getAnnouncementById,
    getAnnouncementBySlug,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    buildAnnouncementsQueryString,
} from '@sentinel/services';
import {
    useAnnouncementsQuery,
    useAnnouncementQuery,
    useCreateAnnouncementMutation,
    useUpdateAnnouncementMutation,
    useDeleteAnnouncementMutation,
} from './index';

// Mock dependencies
vi.mock('@tanstack/react-query', () => {
    const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);
    const mockQueryClient = {
        invalidateQueries: mockInvalidateQueries,
    };
    return {
        useQuery: vi.fn(),
        useMutation: vi.fn((options) => ({
            mutate: vi.fn((variables) => {
                if (options.mutationFn) {
                    options
                        .mutationFn(variables)
                        .then((res: any) => {
                            if (options.onSuccess) {
                                options.onSuccess(res, variables, null);
                            }
                        })
                        .catch((err: any) => {
                            if (options.onError) {
                                options.onError(err, variables, null);
                            }
                        });
                }
            }),
            mutateAsync: vi.fn(async (variables) => {
                if (options.mutationFn) {
                    try {
                        const res = await options.mutationFn(variables);
                        if (options.onSuccess) {
                            await options.onSuccess(res, variables, null);
                        }
                        return res;
                    } catch (err) {
                        if (options.onError) {
                            options.onError(err as Error, variables, null);
                        }
                        throw err;
                    }
                }
            }),
        })),
        useQueryClient: vi.fn(() => mockQueryClient),
    };
});

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => vi.fn()),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

vi.mock('@sentinel/services', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@sentinel/services')>();
    return {
        ...actual,
        getAnnouncements: vi.fn(),
        getAnnouncementById: vi.fn(),
        getAnnouncementBySlug: vi.fn(),
        createAnnouncement: vi.fn(),
        updateAnnouncement: vi.fn(),
        deleteAnnouncement: vi.fn(),
    };
});

describe('Announcements API Helpers & Hooks', () => {
    const mockApiClient = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockApiClient.mockReset();
        (useApi as any).mockReturnValue(mockApiClient);
    });

    describe('buildAnnouncementsQueryString', () => {
        it('should build correct query string from params', () => {
            const query = buildAnnouncementsQueryString({
                page: 2,
                limit: 10,
                search: 'test',
                status: 'published',
            });
            expect(query).toBe('?page=2&limit=10&search=test&status=published');
        });

        it('should omit undefined and empty values', () => {
            const query = buildAnnouncementsQueryString({
                page: undefined,
                search: '',
                status: 'draft',
            });
            expect(query).toBe('?status=draft');
        });

        it('should return empty string if no params', () => {
            const query = buildAnnouncementsQueryString();
            expect(query).toBe('');
        });
    });

    describe('useAnnouncementsQuery', () => {
        it('should call useQuery with correct queryKey and call getAnnouncements', () => {
            const params = { page: 1, limit: 15 };
            useAnnouncementsQuery(params);

            expect(useQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['announcements', params],
                    enabled: true,
                }),
            );

            // Call the queryFn to verify getAnnouncements is called
            const queryOptions = (useQuery as any).mock.calls[0][0];
            queryOptions.queryFn();
            expect(getAnnouncements).toHaveBeenCalledWith(mockApiClient, params);
        });
    });

    describe('useAnnouncementQuery', () => {
        it('should call useQuery with ID queryKey and call getAnnouncementById', () => {
            useAnnouncementQuery({ id: 'announcement-id-123' });

            expect(useQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['announcements', 'announcement-id-123'],
                    enabled: true,
                }),
            );

            const queryOptions = (useQuery as any).mock.calls[0][0];
            queryOptions.queryFn();
            expect(getAnnouncementById).toHaveBeenCalledWith(mockApiClient, 'announcement-id-123');
        });

        it('should call useQuery with slug queryKey and call getAnnouncementBySlug', () => {
            useAnnouncementQuery({ slug: 'test-announcement-slug' });

            expect(useQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['announcements', 'slug', 'test-announcement-slug'],
                    enabled: true,
                }),
            );

            const queryOptions = (useQuery as any).mock.calls[0][0];
            queryOptions.queryFn();
            expect(getAnnouncementBySlug).toHaveBeenCalledWith(
                mockApiClient,
                'test-announcement-slug',
            );
        });
    });

    describe('useCreateAnnouncementMutation', () => {
        it('should invalidate announcements list query on success', async () => {
            const payload = { title: 'New Announcement', content: 'Testing content' };
            const mockCreated = {
                id: 'new-id',
                title: 'New Announcement',
                slug: 'new-announcement',
            };
            (createAnnouncement as any).mockResolvedValue(mockCreated);

            const queryClient = useQueryClient();
            const mutation = useCreateAnnouncementMutation();
            await mutation.mutateAsync(payload);

            expect(createAnnouncement).toHaveBeenCalledWith(mockApiClient, payload);
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['announcements'],
            });
        });
    });

    describe('useUpdateAnnouncementMutation', () => {
        it('should invalidate list and detail queries on success', async () => {
            const updatePayload = {
                id: 'existing-id',
                payload: { title: 'Updated Title' },
            };
            const mockUpdated = {
                id: 'existing-id',
                title: 'Updated Title',
                slug: 'updated-title',
            };
            (updateAnnouncement as any).mockResolvedValue(mockUpdated);

            const queryClient = useQueryClient();
            const mutation = useUpdateAnnouncementMutation();
            await mutation.mutateAsync(updatePayload);

            expect(updateAnnouncement).toHaveBeenCalledWith(mockApiClient, updatePayload);
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['announcements'],
            });
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['announcements', 'existing-id'],
            });
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['announcements', 'slug', 'updated-title'],
            });
        });
    });

    describe('useDeleteAnnouncementMutation', () => {
        it('should call deleteAnnouncement and invalidate list query on success', async () => {
            (deleteAnnouncement as any).mockResolvedValue(undefined);

            const queryClient = useQueryClient();
            const mutation = useDeleteAnnouncementMutation();
            await mutation.mutateAsync('delete-id');

            expect(deleteAnnouncement).toHaveBeenCalledWith(mockApiClient, 'delete-id');
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['announcements'],
            });
        });
    });
});

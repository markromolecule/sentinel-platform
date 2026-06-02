import type { ApiClientType } from '../api-client';

/**
 * Announcement entity representation for the frontend.
 */
export interface Announcement {
    id: string;
    title: string;
    slug: string;
    content: string;
    published_at: string | null;
    unpublished_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    author_id: string | null;
    institution_id: string | null;
}

/**
 * Parameters for querying announcements.
 */
export interface AnnouncementQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'created_at' | 'published_at' | 'title';
    sortOrder?: 'asc' | 'desc';
    status?: 'draft' | 'published' | 'unpublished' | 'all';
}

/**
 * Paginated wrapper for announcements response.
 */
export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/**
 * Data required to create an announcement.
 */
export interface CreateAnnouncementDto {
    title: string;
    slug?: string;
    content: string;
    published_at?: string | null;
    unpublished_at?: string | null;
}

/**
 * Data required to update an announcement.
 */
export type UpdateAnnouncementDto = Partial<CreateAnnouncementDto>;

interface ApiResponse<T> {
    message: string;
    data: T;
}

/**
 * Builds a query string for the announcements endpoint.
 *
 * @param params Query parameters.
 * @returns Query string.
 */
export function buildAnnouncementsQueryString(params?: AnnouncementQueryParams): string {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') {
            continue;
        }
        searchParams.set(key, String(value));
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Retrieves a paginated list of announcements.
 *
 * @param apiClient The API client instance.
 * @param params Optional query filters.
 * @returns A promise resolving to a paginated list of announcements.
 */
export async function getAnnouncements(
    apiClient: ApiClientType,
    params?: AnnouncementQueryParams,
): Promise<PaginatedResponse<Announcement>> {
    const response: PaginatedResponse<Announcement> = await apiClient(
        `/announcements${buildAnnouncementsQueryString(params)}`,
    );
    return response;
}

/**
 * Retrieves a single announcement by its ID.
 *
 * @param apiClient The API client instance.
 * @param id The announcement UUID.
 * @returns A promise resolving to the announcement.
 */
export async function getAnnouncementById(
    apiClient: ApiClientType,
    id: string,
): Promise<Announcement> {
    const response: ApiResponse<Announcement> = await apiClient(`/announcements/${id}`);
    return response.data;
}

/**
 * Retrieves a single announcement by its unique slug.
 *
 * @param apiClient The API client instance.
 * @param slug The announcement slug.
 * @returns A promise resolving to the announcement.
 */
export async function getAnnouncementBySlug(
    apiClient: ApiClientType,
    slug: string,
): Promise<Announcement> {
    const response: ApiResponse<Announcement> = await apiClient(`/announcements/slug/${slug}`);
    return response.data;
}

/**
 * Creates a new announcement.
 *
 * @param apiClient The API client instance.
 * @param payload The creation payload.
 * @returns A promise resolving to the created announcement.
 */
export async function createAnnouncement(
    apiClient: ApiClientType,
    payload: CreateAnnouncementDto,
): Promise<Announcement> {
    const response: ApiResponse<Announcement> = await apiClient('/announcements', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return response.data;
}

/**
 * Updates an existing announcement. Supports both signatures:
 * - updateAnnouncement(apiClient, id, payload)
 * - updateAnnouncement(apiClient, { id, payload })
 *
 * @param apiClient The API client instance.
 * @param idOrObj The announcement ID or an object containing the ID and the payload.
 * @param payloadOrUndefined The update payload if the second argument was a string ID.
 * @returns A promise resolving to the updated announcement.
 */
export async function updateAnnouncement(
    apiClient: ApiClientType,
    idOrObj: string | { id: string; payload: UpdateAnnouncementDto },
    payloadOrUndefined?: UpdateAnnouncementDto,
): Promise<Announcement> {
    let id: string;
    let payload: UpdateAnnouncementDto;

    if (typeof idOrObj === 'string') {
        id = idOrObj;
        payload = payloadOrUndefined!;
    } else {
        id = idOrObj.id;
        payload = idOrObj.payload;
    }

    const response: ApiResponse<Announcement> = await apiClient(`/announcements/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return response.data;
}

/**
 * Soft-deletes an announcement.
 *
 * @param apiClient The API client instance.
 * @param id The announcement UUID.
 */
export async function deleteAnnouncement(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/announcements/${id}`, {
        method: 'DELETE',
    });
}

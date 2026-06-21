export type PaginatedApiResponse<T> = {
    items: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages?: number;
        hasMore: boolean;
    };
};

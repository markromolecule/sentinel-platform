export interface ApiResponse<T> {
    message: string;
    data: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

export interface ApiDepartment {
    department_id: string;
    department_name: string;
    department_code: string | null;
    created_at: string | null;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
}

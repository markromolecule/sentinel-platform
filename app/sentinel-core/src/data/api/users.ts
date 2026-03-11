import { UserFormValues } from '@sentinel/shared/schema';
import { UserRole, UserStatus } from '@sentinel/shared/types';
import { apiClient } from './client';

// Map the shape returning from the API which relies on DB tables
export interface ApiUser {
    user_id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    department: string | null;
    studentNo: string | null;
    institution: string | null;
    status: UserStatus;
    created_at: string | Date;
    updated_at: string | Date | null;
    created_by: string | null;
    updated_by: string | null;
}

// User frontend interface to match table expects (Mock Admin User shape)
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    department?: string;
    status: UserStatus;
    studentNo?: string;
    createdAt?: string | Date;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

// Map the API response to the frontend User type
function mapUser(apiUser: ApiUser): User {
    return {
        id: apiUser.user_id,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        email: apiUser.email,
        role: apiUser.role,
        department: apiUser.department ?? undefined,
        studentNo: apiUser.studentNo ?? undefined,
        status: apiUser.status,
        createdAt: apiUser.created_at,
    };
}

export async function getUsers(): Promise<User[]> {
    const response: ApiResponse<ApiUser[]> = await apiClient('/users');
    return response.data.map(mapUser);
}

export async function createUser(payload: UserFormValues): Promise<User> {
    const response: ApiResponse<ApiUser> = await apiClient('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapUser(response.data);
}

export async function updateUser({
    id,
    payload,
}: {
    id: string;
    payload: Partial<UserFormValues>;
}): Promise<User> {
    const response: ApiResponse<ApiUser> = await apiClient(`/users/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapUser(response.data);
}

export async function deleteUser(id: string): Promise<void> {
    await apiClient(`/users/${id}`, {
        method: 'DELETE',
    });
}

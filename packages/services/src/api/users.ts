import { UserFormValues } from '@sentinel/shared/schema';
import { UserRole, UserStatus } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

// Map the shape returning from the API which relies on DB tables
export interface ApiUser {
    user_id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    department: string | null;
    departmentCode?: string | null;
    department_id?: string | null;
    departmentId?: string | null;
    course?: string | null;
    course_id?: string | null;
    courseId?: string | null;
    course_ids?: string[] | null;
    courseIds?: string[] | null;
    courses?: string[] | null;
    studentNo: string | null;
    employeeNo?: string | null;
    institution: string | null;
    institution_id?: string | null;
    institutionId?: string | null;
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
    departmentCode?: string | null;
    departmentId?: string | null;
    course?: string;
    courses?: string[];
    courseId?: string | null;
    courseIds?: string[];
    institution?: string;
    institutionId?: string | null;
    status: UserStatus;
    studentNo?: string;
    employeeNo?: string;
    createdAt?: string | Date;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

// Map the API response to the frontend User type
function mapUser(apiUser: ApiUser): User {
    const departmentId = apiUser.department_id ?? apiUser.departmentId ?? null;
    const courseId = apiUser.course_id ?? apiUser.courseId ?? null;
    const institutionId = apiUser.institution_id ?? apiUser.institutionId ?? null;
    const courseIds = apiUser.course_ids ?? apiUser.courseIds ?? (courseId ? [courseId] : []);

    return {
        id: apiUser.user_id,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        email: apiUser.email,
        role: apiUser.role,
        department: apiUser.department ?? undefined,
        departmentCode: apiUser.departmentCode ?? apiUser.department ?? null,
        departmentId,
        course: apiUser.course ?? apiUser.courses?.join(', ') ?? undefined,
        courses: apiUser.courses ?? undefined,
        courseId,
        courseIds,
        institution: apiUser.institution ?? undefined,
        institutionId,
        studentNo: apiUser.studentNo ?? undefined,
        employeeNo: apiUser.employeeNo ?? undefined,
        status: apiUser.status,
        createdAt: apiUser.created_at,
    };
}

export async function getUsers(apiClient: ApiClientType, search?: string): Promise<User[]> {
    const url = search ? `/users?search=${encodeURIComponent(search)}` : '/users';
    const response: ApiResponse<ApiUser[]> = await apiClient(url);
    return response.data.map(mapUser);
}

export async function getUser(apiClient: ApiClientType, id: string): Promise<User> {
    const response: ApiResponse<ApiUser> = await apiClient(`/users/${id}`);
    return mapUser(response.data);
}

export async function createUser(apiClient: ApiClientType, payload: UserFormValues): Promise<User> {
    const response: ApiResponse<ApiUser> = await apiClient('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapUser(response.data);
}

export async function inviteUser(apiClient: ApiClientType, payload: UserFormValues): Promise<User> {
    const response: ApiResponse<ApiUser> = await apiClient('/users/invite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapUser(response.data);
}

export async function updateUser(apiClient: ApiClientType, {
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

export async function deleteUser(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/users/${id}`, {
        method: 'DELETE',
    });
}

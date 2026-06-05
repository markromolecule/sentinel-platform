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
    subject?: string | null;
    section?: string | null;
    term?: string | null;
    yearLevel?: string | null;
    active_permission_keys?: string[] | null;
    activePermissionKeys?: string[] | null;
    avatarUrl?: string | null;
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
    department_id?: string | null; // API alias
    course?: string;
    courses?: string[];
    courseId?: string | null;
    course_id?: string | null; // API alias
    courseIds?: string[];
    institution?: string;
    institutionId?: string | null;
    institution_id?: string | null; // API alias
    status: UserStatus;
    studentNo?: string;
    employeeNo?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date | null;
    activePermissionKeys?: string[];
    avatarUrl?: string | null;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

interface InviteUserApiResponse extends ApiResponse<ApiUser> {
    inviteDelivery?: 'email' | 'generated_link';
    inviteLink?: string;
}

export interface InviteUserResult {
    user: User;
    inviteDelivery?: 'email' | 'generated_link';
    inviteLink?: string;
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
        departmentId: departmentId ?? undefined,
        department_id: departmentId ?? undefined,
        course: apiUser.course ?? apiUser.courses?.join(', ') ?? undefined,
        courses: apiUser.courses ?? undefined,
        courseId,
        course_id: courseId ?? undefined,
        courseIds,
        institution: apiUser.institution ?? undefined,
        institutionId,
        studentNo: apiUser.studentNo ?? undefined,
        employeeNo: apiUser.employeeNo ?? undefined,
        status: apiUser.status,
        createdAt: apiUser.created_at,
        updatedAt: apiUser.updated_at ?? null,
        activePermissionKeys:
            apiUser.active_permission_keys ?? apiUser.activePermissionKeys ?? undefined,
        avatarUrl: apiUser.avatarUrl ?? null,
    };
}

export async function getUsers(
    apiClient: ApiClientType,
    params?: {
        search?: string;
        limit?: number;
        offset?: number;
        departmentId?: string;
        institutionId?: string;
        role?: string | string[];
    },
): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));
    if (params?.offset !== undefined) queryParams.append('offset', String(params.offset));
    if (params?.departmentId) queryParams.append('department_id', params.departmentId);
    if (params?.institutionId) queryParams.append('institution_id', params.institutionId);
    if (params?.role) {
        queryParams.append(
            'role',
            Array.isArray(params.role) ? params.role.join(',') : params.role,
        );
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

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

export async function inviteUser(
    apiClient: ApiClientType,
    payload: UserFormValues,
): Promise<InviteUserResult> {
    const response: InviteUserApiResponse = await apiClient('/users/invite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return {
        user: mapUser(response.data),
        inviteDelivery: response.inviteDelivery,
        inviteLink: response.inviteLink,
    };
}

export async function updateUser(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: Partial<UserFormValues>;
    },
): Promise<User> {
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

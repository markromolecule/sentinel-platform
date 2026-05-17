import { describe, expect, it } from 'vitest';
import {
    buildManagedUserPayload,
    getManagedUserProfileDefaults,
    normalizeManagedUserCourseIds,
    resolveManagedUserDefaultRole,
} from './use-managed-user-form';
import type { UserFormValues } from '@sentinel/shared/schema';

function buildValues(overrides: Partial<UserFormValues> = {}): UserFormValues {
    return {
        firstName: 'Jamie',
        lastName: 'Doe',
        email: 'jamie@example.com',
        role: 'student',
        department: 'department-1',
        course: 'course-1',
        courseIds: [],
        studentNo: '2026-001',
        employeeNo: '',
        institution: 'institution-1',
        ...overrides,
    };
}

describe('useManagedUserForm helpers', () => {
    it('resolves default roles from forced role, explicit role, and pathname context', () => {
        expect(resolveManagedUserDefaultRole('/users', undefined, 'admin')).toBe('admin');
        expect(resolveManagedUserDefaultRole('/users', 'instructor')).toBe('instructor');
        expect(resolveManagedUserDefaultRole('/users/students')).toBe('student');
        expect(resolveManagedUserDefaultRole('/users/instructors')).toBe('instructor');
    });

    it('derives institution-lock defaults only for non-superadmin profiles', () => {
        expect(
            getManagedUserProfileDefaults({
                currentUserProfile: {
                    institutionId: 'institution-1',
                    departmentId: 'department-1',
                },
                isSuperadmin: false,
            }),
        ).toEqual({
            institution: 'institution-1',
            department: 'department-1',
        });

        expect(
            getManagedUserProfileDefaults({
                currentUserProfile: {
                    institutionId: 'institution-1',
                    departmentId: 'department-1',
                },
                isSuperadmin: true,
            }),
        ).toEqual({
            institution: '',
            department: '',
        });
    });

    it('normalizes instructor and forced-admin payloads for mutations', () => {
        expect(
            normalizeManagedUserCourseIds(
                buildValues({
                    role: 'instructor',
                    course: 'course-1',
                    courseIds: ['course-1', 'course-2', 'course-1'],
                }),
            ),
        ).toEqual(['course-1', 'course-2']);

        expect(
            buildManagedUserPayload(
                buildValues({
                    role: 'instructor',
                    course: 'course-1',
                    courseIds: ['course-1', 'course-2', 'course-1'],
                    employeeNo: 'EMP-1',
                }),
            ),
        ).toMatchObject({
            role: 'instructor',
            course: 'course-1',
            courseIds: ['course-1', 'course-2'],
            employeeNo: 'EMP-1',
        });

        expect(
            buildManagedUserPayload(
                buildValues({
                    role: 'student',
                    course: 'course-3',
                    courseIds: ['course-2'],
                    studentNo: '2026-009',
                    employeeNo: 'EMP-9',
                }),
                'admin',
            ),
        ).toMatchObject({
            role: 'admin',
            course: 'course-3',
            courseIds: [],
            studentNo: undefined,
            employeeNo: undefined,
        });
    });
});

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { UserRole } from '@sentinel/shared/types';

type StudentRecord = {
    student_number: string | null;
    department_id: string | null;
} | null;

export type WebAuthState = {
    role: UserRole | null;
    hasStudentRecord: boolean;
    isFullyOnboarded: boolean;
    destination: string;
};

export function normalizeUserRole(role: unknown): UserRole | null {
    if (typeof role !== 'string') {
        return null;
    }

    const normalizedRole = role.toLowerCase();
    const knownRoles: UserRole[] = [
        'admin',
        'proctor',
        'student',
        'instructor',
        'superadmin',
        'disciplinary_officer',
        'support',
    ];

    return knownRoles.includes(normalizedRole as UserRole) ? (normalizedRole as UserRole) : null;
}

async function getStudentRecord(supabase: SupabaseClient, userId: string): Promise<StudentRecord> {
    const { data, error } = await supabase
        .from('students')
        .select('student_number, department_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Unable to read student auth state:', error.message);
        return null;
    }

    return data;
}

export async function resolveWebAuthState(
    supabase: SupabaseClient,
    user: User,
): Promise<WebAuthState> {
    const role = normalizeUserRole(user.user_metadata?.role);
    const studentRecord = await getStudentRecord(supabase, user.id);
    const hasStudentRecord = !!studentRecord;
    const isFullyOnboarded = !!(studentRecord?.student_number && studentRecord?.department_id);

    if (role === 'instructor') {
        return {
            role,
            hasStudentRecord,
            isFullyOnboarded,
            destination: '/dashboard',
        };
    }

    if (role && role !== 'student' && !hasStudentRecord) {
        return {
            role,
            hasStudentRecord,
            isFullyOnboarded,
            destination: '/auth/login?error=Unauthorized role access',
        };
    }

    return {
        role: 'student',
        hasStudentRecord,
        isFullyOnboarded,
        destination: isFullyOnboarded ? '/student/classroom' : '/onboarding',
    };
}

import { SYSTEM_ROLE_BLUEPRINTS } from '@sentinel/shared/constants';
import type { AccessControlPermission } from '@sentinel/shared/types';
import { formatActionLabel } from './formatters';

export type CrudBucketKey = 'view' | 'create' | 'update' | 'delete';

export function getModuleHelperText(moduleKey: string) {
    const helpers: Record<string, string> = {
        institutions: 'Global institution setup and lifecycle control.',
        departments: 'Department structure, ownership, and academic grouping.',
        semesters: 'Term setup, dates, and scheduling windows.',
        rooms: 'Institution-scoped examination venues and room availability.',
        users: 'Account provisioning and role-targeted user creation.',
        access_control: 'RBAC catalog, assignments, and permission ownership.',
        courses: 'Department-level course maintenance and oversight.',
        sections: 'Course-level section creation and upkeep.',
        subjects: 'Shared subject catalog and academic metadata.',
        subject_offerings: 'Offered-subject lifecycle including offer and approval.',
        subject_requests: 'Instructor requests and approval flow for subject participation.',
        student_whitelist: 'Student whitelist intake, correction, import, and purge.',
        examination_settings: 'Global examination defaults and enforcement baselines.',
        examinations: 'Exam access, participation, and publishing lifecycle.',
        results: 'Assessment results and completion visibility.',
        proctoring: 'Live sessions, monitoring, and flag response.',
        incidents: 'Incident review, evidence, and disciplinary action.',
        reports: 'Operational and compliance reporting output.',
        guides: 'Guides and help resources available to the role.',
        announcements: 'Institutional announcements and communication alerts.',
        dashboard: 'Role dashboard visibility and summaries.',
    };

    return helpers[moduleKey] ?? 'Permission coverage for this module.';
}

export function mapActionKeyToCrudBucket(actionKey: string): CrudBucketKey {
    if (actionKey === 'view' || actionKey === 'view_sessions' || actionKey === 'export') {
        return 'view';
    }

    if (
        actionKey === 'create' ||
        actionKey.startsWith('create_') ||
        actionKey === 'offer' ||
        actionKey === 'request' ||
        actionKey === 'import'
    ) {
        return 'create';
    }

    if (actionKey === 'delete' || actionKey === 'purge') {
        return 'delete';
    }

    return 'update';
}

export function getCrudBucketLabel(bucketKey: CrudBucketKey) {
    const labels: Record<CrudBucketKey, string> = {
        view: 'View',
        create: 'Create',
        update: 'Update',
        delete: 'Delete',
    };

    return labels[bucketKey];
}

export function getCrudBucketHelperText(
    bucketKey: CrudBucketKey,
    permissions: AccessControlPermission[],
) {
    if (permissions.length === 0) {
        return 'Not used';
    }

    const labels = permissions
        .map((permission) => formatActionLabel(permission.actionKey))
        .sort((left, right) => left.localeCompare(right));

    return labels.join(', ');
}

export function getSystemRoleResponsibilities(roleName: string) {
    return SYSTEM_ROLE_BLUEPRINTS[roleName]?.responsibilities ?? [];
}

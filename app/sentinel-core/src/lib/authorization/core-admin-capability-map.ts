import type { CoreRole } from '@/lib/auth/core-role';

export type CoreAdminPageId =
    | 'overview'
    | 'calendar'
    | 'sections'
    | 'subjects'
    | 'offered-subjects'
    | 'subject-classifications'
    | 'subject-requests'
    | 'courses'
    | 'classrooms'
    | 'administrators'
    | 'administrator-whitelist'
    | 'permissions'
    | 'rooms'
    | 'departments'
    | 'semesters'
    | 'analytics'
    | 'logs'
    | 'messages'
    | 'announcements'
    | 'exams'
    | 'question-bank';

export interface CoreAdminPageCapability {
    id: CoreAdminPageId;
    title: string;
    primaryPath: string;
    aliases: string[];
    allowedRoles: CoreRole[];
    requiredViewPermissions: string[];
    requiredActionPermissions: string[];
}

/**
 * Centralized capability definitions for `sentinel-core` administration pages.
 */
export const CORE_ADMIN_PAGE_CAPABILITIES: Record<CoreAdminPageId, CoreAdminPageCapability> = {
    overview: {
        id: 'overview',
        title: 'Overview',
        primaryPath: '/dashboard',
        aliases: ['/dashboard'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['dashboard:view'],
        requiredActionPermissions: [],
    },
    calendar: {
        id: 'calendar',
        title: 'Calendar',
        primaryPath: '/calendar',
        aliases: ['/calendar'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: [],
        requiredActionPermissions: [],
    },
    sections: {
        id: 'sections',
        title: 'Sections',
        primaryPath: '/sections',
        aliases: ['/sections'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['sections:view'],
        requiredActionPermissions: ['sections:create', 'sections:update', 'sections:delete'],
    },
    subjects: {
        id: 'subjects',
        title: 'Subject List',
        primaryPath: '/subjects',
        aliases: ['/subjects'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['subjects:view'],
        requiredActionPermissions: ['subjects:create', 'subjects:update', 'subjects:delete'],
    },
    'offered-subjects': {
        id: 'offered-subjects',
        title: 'Offered Subjects',
        primaryPath: '/subjects/offered',
        aliases: ['/subjects/offered'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['subject_offerings:view'],
        requiredActionPermissions: [
            'subject_offerings:offer',
            'subject_offerings:update',
            'subject_offerings:delete',
        ],
    },
    'subject-classifications': {
        id: 'subject-classifications',
        title: 'Subject Classification',
        primaryPath: '/subjects/classifications',
        aliases: ['/subjects/classifications'],
        allowedRoles: ['superadmin'],
        requiredViewPermissions: ['subjects:view'],
        requiredActionPermissions: ['subjects:create', 'subjects:update', 'subjects:delete'],
    },
    'subject-requests': {
        id: 'subject-requests',
        title: 'Enrollment Requests',
        primaryPath: '/subjects/requests',
        aliases: ['/subjects/requests'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['subject_offerings:view'],
        requiredActionPermissions: ['subject_offerings:approve'],
    },

    courses: {
        id: 'courses',
        title: 'Courses',
        primaryPath: '/courses',
        aliases: ['/courses'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['courses:view'],
        requiredActionPermissions: ['courses:create', 'courses:update', 'courses:delete'],
    },
    classrooms: {
        id: 'classrooms',
        title: 'Classrooms',
        primaryPath: '/classrooms',
        aliases: ['/classrooms'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['classrooms:view'],
        requiredActionPermissions: ['classrooms:create', 'classrooms:update', 'classrooms:delete'],
    },
    administrators: {
        id: 'administrators',
        title: 'Administrators',
        primaryPath: '/administrators',
        aliases: ['/administrators'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['users:view'],
        requiredActionPermissions: ['users:create_admin', 'users:update', 'users:delete'],
    },
    'administrator-whitelist': {
        id: 'administrator-whitelist',
        title: 'Whitelist',
        primaryPath: '/administrators/whitelist',
        aliases: ['/administrators/whitelist'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['users:view'],
        requiredActionPermissions: ['users:create_admin', 'users:update', 'users:delete'],
    },
    permissions: {
        id: 'permissions',
        title: 'Permissions',
        primaryPath: '/permissions',
        aliases: ['/permissions'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['access_control:view'],
        requiredActionPermissions: [
            'access_control:manage_roles',
            'access_control:manage_permissions',
            'access_control:manage_assignments',
        ],
    },
    rooms: {
        id: 'rooms',
        title: 'Rooms',
        primaryPath: '/rooms',
        aliases: ['/rooms'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['rooms:view'],
        requiredActionPermissions: ['rooms:create', 'rooms:update', 'rooms:delete'],
    },

    departments: {
        id: 'departments',
        title: 'Departments',
        primaryPath: '/departments',
        aliases: ['/departments'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['departments:view'],
        requiredActionPermissions: [
            'departments:create',
            'departments:update',
            'departments:delete',
        ],
    },
    semesters: {
        id: 'semesters',
        title: 'Semesters',
        primaryPath: '/semesters',
        aliases: ['/semesters'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['semesters:view'],
        requiredActionPermissions: ['semesters:create', 'semesters:update', 'semesters:delete'],
    },
    analytics: {
        id: 'analytics',
        title: 'Reports & Analytics',
        primaryPath: '/analytics',
        aliases: ['/analytics'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: [],
        requiredActionPermissions: [],
    },
    logs: {
        id: 'logs',
        title: 'System Logs',
        primaryPath: '/logs',
        aliases: ['/logs'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: [],
        requiredActionPermissions: [],
    },
    messages: {
        id: 'messages',
        title: 'Messages',
        primaryPath: '/messages',
        aliases: ['/messages'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: [],
        requiredActionPermissions: [],
    },
    announcements: {
        id: 'announcements',
        title: 'Announcements',
        primaryPath: '/announcements',
        aliases: ['/announcements'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: [],
        requiredActionPermissions: [],
    },
    exams: {
        id: 'exams',
        title: 'Exams Management',
        primaryPath: '/exams',
        aliases: ['/exams'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['assessments:view'],
        requiredActionPermissions: ['assessments:manage'],
    },
    'question-bank': {
        id: 'question-bank',
        title: 'Question Bank',
        primaryPath: '/question',
        aliases: ['/question'],
        allowedRoles: ['admin', 'superadmin'],
        requiredViewPermissions: ['assessments:view'],
        requiredActionPermissions: ['assessments:manage'],
    },
};

/**
 * Returns the capability definition for a given page identifier.
 */
export function getCoreAdminPageCapability(pageId: CoreAdminPageId) {
    return CORE_ADMIN_PAGE_CAPABILITIES[pageId];
}

/**
 * Resolves a page capability from the current pathname or one of its aliases.
 */
export function findCoreAdminPageCapabilityByPath(pathname: string) {
    return Object.values(CORE_ADMIN_PAGE_CAPABILITIES).find((page) =>
        page.aliases.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`)),
    );
}

/**
 * Checks whether a role is eligible to access a page before permission filtering is applied.
 */
export function isRoleEligibleForCoreAdminPage(
    pageId: CoreAdminPageId,
    role: CoreRole | null | undefined,
) {
    if (!role) {
        return false;
    }

    return CORE_ADMIN_PAGE_CAPABILITIES[pageId].allowedRoles.includes(role);
}

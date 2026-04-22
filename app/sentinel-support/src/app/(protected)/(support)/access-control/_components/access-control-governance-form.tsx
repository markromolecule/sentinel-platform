'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AccessControlPageShell } from './access-control-page-shell';
import { AccessControlWorkspaceShell } from './access-control-workspace-shell';
import { type AccessControlSection } from './access-control-nav';

import { DashboardView } from './views/dashboard-view';
import { RoleMatrixView } from './views/role-matrix-view';
import { PermissionRegistryView } from './views/permission-registry-view';
import { AssignmentManagerView } from './views/assignment-manager-view';
import { ExaminationGovernanceView } from './views/examination-governance-view';

const SECTION_METADATA: Record<AccessControlSection, { title: string; description: string }> = {
    overview: {
        title: 'Governance Overview',
        description: 'High-level dashboard tracking RBAC health, role baselines, and permission coverage across the platform.',
    },
    roles: {
        title: 'Role Matrix',
        description: 'Manage and review the access matrix. Each column represents a system or custom role, while rows display permission coverage.',
    },
    permissions: {
        title: 'Permission Registry',
        description: 'Manage the comprehensive permission registry. Search by key, module, or type, and edit entries inline.',
    },
    assignments: {
        title: 'Role Assignments',
        description: 'Manage administrative elevations and role ownership. Link accounts to specific governance baselines.',
    },
    'examination-settings': {
        title: 'Examination Defaults',
        description: 'Tune the global examination baseline for access requirements, monitoring, and protection defaults.',
    },
};

export function AccessControlGovernanceForm() {
    const pathname = usePathname();
    const router = useRouter();

    const activeSection = useMemo<AccessControlSection>(() => {
        if (pathname.endsWith('/roles')) return 'roles';
        if (pathname.endsWith('/permissions')) return 'permissions';
        if (pathname.endsWith('/assignments')) return 'assignments';
        if (pathname.endsWith('/examination-settings')) return 'examination-settings';
        return 'overview';
    }, [pathname]);

    const handleSectionChange = (section: AccessControlSection) => {
        const path = section === 'overview' ? '/access-control' : `/access-control/${section}`;
        router.push(path);
    };

    const renderView = () => {
        switch (activeSection) {
            case 'overview':
                return <DashboardView onNavigate={handleSectionChange} />;
            case 'roles':
                return <RoleMatrixView />;
            case 'permissions':
                return <PermissionRegistryView />;
            case 'assignments':
                return <AssignmentManagerView />;
            case 'examination-settings':
                return <ExaminationGovernanceView />;
            default:
                return <DashboardView onNavigate={handleSectionChange} />;
        }
    };

    const metadata = SECTION_METADATA[activeSection];

    return (
        <AccessControlWorkspaceShell 
            activeSection={activeSection} 
            onActiveSectionChange={handleSectionChange}
        >
            <div className="flex flex-col gap-8">
                <AccessControlPageShell
                    title={metadata.title}
                    description={metadata.description}
                >
                    {renderView()}
                </AccessControlPageShell>
            </div>
        </AccessControlWorkspaceShell>
    );
}

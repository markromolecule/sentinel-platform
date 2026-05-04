'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AccessControlPageShell } from '../layout/control-page-shell';
import { AccessControlWorkspaceShell } from '../layout/control-workspace-shell';
import { type AccessControlSection } from '../layout/control-nav';

import { DashboardView } from '../views/dashboard-view';
import { RoleMatrixView } from '../views/role-matrix-view';
import { PermissionRegistryView } from '../views/permission-registry-view';
import { AssignmentManagerView } from '../views/assignment-manager-view';
import { ExaminationGovernanceView } from '../views/examination-governance-view';

const SECTION_METADATA: Record<AccessControlSection, { title: string; description: string }> = {
    overview: {
        title: 'Overview',
        description: '',
    },
    roles: {
        title: 'Role Matrix',
        description: '',
    },
    permissions: {
        title: 'Permission Registry',
        description: '',
    },
    assignments: {
        title: 'Role Assignments',
        description: '',
    },
    'examination-settings': {
        title: 'Examination Defaults',
        description: '',
    },
};

export function AccessControlGovernanceForm() {
    const pathname = usePathname();
    const router = useRouter();
    const [sectionActions, setSectionActions] = useState<ReactNode>(null);

    const activeSection = useMemo<AccessControlSection>(() => {
        if (pathname.endsWith('/roles')) return 'roles';
        if (pathname.endsWith('/permissions')) return 'permissions';
        if (pathname.endsWith('/assignments')) return 'assignments';
        if (pathname.endsWith('/examination-settings')) return 'examination-settings';
        return 'overview';
    }, [pathname]);

    const handleSectionChange = (section: AccessControlSection) => {
        const path = section === 'overview' ? '/control' : `/control/${section}`;
        router.push(path);
    };

    const renderView = () => {
        switch (activeSection) {
            case 'overview':
                return <DashboardView onNavigate={handleSectionChange} />;
            case 'roles':
                return <RoleMatrixView />;
            case 'permissions':
                return <PermissionRegistryView setActions={setSectionActions} />;
            case 'assignments':
                return <AssignmentManagerView setActions={setSectionActions} />;
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
                    actions={sectionActions}
                >
                    {renderView()}
                </AccessControlPageShell>
            </div>
        </AccessControlWorkspaceShell>
    );
}

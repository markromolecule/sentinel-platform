'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IdentityPageShell } from '../layout/identity-page-shell';
import { IdentityWorkspaceShell } from '../layout/identity-workspace-shell';
import { type IdentitySection } from '../layout/identity-nav';

import { UsersOverviewView } from '../views/users-overview-view';
import { DeanManagementView } from '../views/dean-management-view';
import { SupportManagementView } from '../views/support-management-view';
import { WhitelistManagementView } from '../../whitelist/_components/views/whitelist-management-view';

const SECTION_METADATA: Record<IdentitySection, { title: string; description: string }> = {
    overview: {
        title: 'Identity & Access',
        description: 'Manage system administrators, including deans and support staff.',
    },
    dean: {
        title: 'Dean Management',
        description: 'Create and manage dean accounts.',
    },
    support: {
        title: 'Support Management',
        description: 'Create and manage support staff accounts for the system.',
    },
    whitelist: {
        title: 'Support Whitelist Management',
        description: 'Manage approved student identities with global administrative access.',
    },
};

export function IdentityGovernanceForm() {
    const pathname = usePathname();
    const router = useRouter();
    const [sectionActions, setSectionActions] = useState<ReactNode>(null);

    const activeSection = useMemo<IdentitySection>(() => {
        if (pathname.endsWith('/dean')) return 'dean';
        if (pathname.endsWith('/support')) return 'support';
        if (pathname.endsWith('/whitelist')) return 'whitelist';
        return 'overview';
    }, [pathname]);

    const handleSectionChange = (section: IdentitySection) => {
        const path = section === 'overview' ? '/users' : `/users/${section}`;
        router.push(path);
    };

    const renderView = () => {
        switch (activeSection) {
            case 'overview':
                return <UsersOverviewView />;
            case 'dean':
                return <DeanManagementView setActions={setSectionActions} />;
            case 'support':
                return <SupportManagementView setActions={setSectionActions} />;
            case 'whitelist':
                return <WhitelistManagementView insideShell setActions={setSectionActions} />;
            default:
                return <UsersOverviewView />;
        }
    };

    const metadata = SECTION_METADATA[activeSection];

    return (
        <IdentityWorkspaceShell
            activeSection={activeSection}
            onActiveSectionChange={handleSectionChange}
        >
            <div className="flex flex-col gap-8">
                <IdentityPageShell
                    title={metadata.title}
                    description={metadata.description}
                    actions={sectionActions}
                >
                    {renderView()}
                </IdentityPageShell>
            </div>
        </IdentityWorkspaceShell>
    );
}

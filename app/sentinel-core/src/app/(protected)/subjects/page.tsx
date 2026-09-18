'use client';

import { useActivePermissions } from '@sentinel/hooks';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { SubjectPageShell } from './_components/layout';
import { SubjectsView } from './_components/views/subjects-view';
import { AddSubjectDialog, BulkUploadDialog } from './_components';

/**
 * SharedSubjectsPage renders the administrator/catalog-manager subject listing page,
 * wrapped in the SubjectPageShell layout.
 */
export default function SharedSubjectsPage() {
    const { role } = useAcademicScope();
    const { hasPermission } = useActivePermissions();

    const isCatalogManager = role === 'superadmin' || role === 'admin';
    const canCreateSubject = hasPermission('subjects:create');

    const actions = (
        <div className="flex items-center gap-2">
            {isCatalogManager && canCreateSubject && (
                <>
                    <AddSubjectDialog />
                    <BulkUploadDialog />
                </>
            )}
        </div>
    );

    return (
        <SubjectPageShell
            title="Course List"
            description={
                isCatalogManager
                    ? 'Manage the shared institutional course catalog used for term offerings.'
                    : 'Browse the shared institutional course catalog and offer courses to your assigned department.'
            }
            actions={actions}
        >
            <SubjectsView />
        </SubjectPageShell>
    );
}

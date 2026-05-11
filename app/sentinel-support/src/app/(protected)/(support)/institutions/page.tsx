'use client';

import {
    isPermissionDeniedError,
    useDebounce,
    useInstitutionsQuery,
    useStableValue,
} from '@sentinel/hooks';
import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    AddInstitutionDialog,
    InstitutionsList,
    InstitutionWizardDialog,
} from '@/app/(protected)/(support)/institutions/_components';
import { PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Wand2, ChevronLeft, Edit2 } from 'lucide-react';

function SupportInstitutionsPageContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const searchParams = useSearchParams();
    const router = useRouter();
    const parentId = searchParams.get('parentId');
    const [editParentOpen, setEditParentOpen] = useState(false);

    const {
        data: institutions = [],
        isLoading,
        isError,
        error,
    } = useInstitutionsQuery(debouncedSearch);
    const visibleInstitutions = useStableValue(() => {
        if (parentId) {
            return institutions.filter((i) => i.parentInstitutionId === parentId);
        }
        return institutions.filter((i) => i.institutionKind !== 'CHILD');
    }, [institutions, parentId]);

    const parentInstitution = useMemo(
        () => institutions.find((i) => i.id === parentId),
        [institutions, parentId],
    );

    const isInitialLoading = useStableValue(
        () => isLoading && visibleInstitutions.length === 0,
        [isLoading, visibleInstitutions],
    );
    const showErrorState = useStableValue(() => isError, [isError]);
    const isViewDenied = isPermissionDeniedError(error, 'institutions:view');

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title={
                    parentInstitution
                        ? `${parentInstitution.name}`
                        : 'Institution Management'
                }
                description={
                    parentInstitution
                        ? 'Manage branches for this institution.'
                        : 'Manage academic institutions and their configurations.'
                }
            >
                {!isViewDenied ? (
                    <div className="flex flex-wrap gap-2">
                        {parentId ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/institutions')}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back to Institutions
                                </Button>
                                {parentInstitution && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditParentOpen(true)}
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Edit Parent
                                        </Button>
                                        <InstitutionWizardDialog
                                            open={editParentOpen}
                                            onOpenChange={setEditParentOpen}
                                            institution={parentInstitution}
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <AddInstitutionDialog />
                                <Button asChild className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                                    <Link href="/institutions/new">
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        Setup Wizard
                                    </Link>
                                </Button>
                            </>
                        )}
                        {parentId && parentInstitution ? (
                            <AddInstitutionDialog parentInstitution={parentInstitution} />
                        ) : null}
                    </div>
                ) : null}
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="institutions" className="h-[360px]" />
            ) : (
                <div className="relative">
                    <InstitutionsList
                        institutions={visibleInstitutions}
                        lookupInstitutions={institutions}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                    />

                    {isInitialLoading && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {showErrorState && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading institutions. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SupportInstitutionsPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading institutions...</div>}>
            <SupportInstitutionsPageContent />
        </Suspense>
    );
}

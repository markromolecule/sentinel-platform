'use client';

import { useMemo, useState } from 'react';
import { useDebounce, useSubjectsQuery } from '@sentinel/hooks';
import {
    AddSubjectDialog,
    BulkUploadDialog,
    createMasterColumns,
    OfferSubjectDialog,
    SubjectsList,
} from '@/app/(protected)/(admin)/subjects/_components';
import { Button, PageHeader, Separator } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { useAcademicScope } from '@/hooks/use-academic-scope';

export default function SharedSubjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [offerSubjectOpen, setOfferSubjectOpen] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { role } = useAcademicScope();

    const canManageCatalog = role === 'superadmin';
    const { data: subjects = [], isLoading, isError } = useSubjectsQuery(debouncedSearch || undefined);
    const columns = useMemo(
        () => createMasterColumns({ canManageCatalog }),
        [canManageCatalog],
    );

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Subject Management"
                description={
                    canManageCatalog
                        ? 'Manage the shared institutional subject catalog used for term offerings.'
                        : 'Browse the shared institutional subject catalog and offer subjects to your assigned course.'
                }
            >
                {canManageCatalog && <BulkUploadDialog />}
                <Button
                    variant={canManageCatalog ? 'outline' : 'default'}
                    onClick={() => setOfferSubjectOpen(true)}
                    className={
                        canManageCatalog
                            ? 'border-[#323d8f]/20 text-[#323d8f] hover:bg-[#323d8f]/5'
                            : 'bg-[#323d8f] hover:bg-[#323d8f]/90'
                    }
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Offer Subject
                </Button>
                {canManageCatalog && <AddSubjectDialog />}
            </PageHeader>
            <Separator />

            <div className="relative">
                <SubjectsList
                    subjects={subjects}
                    columns={columns}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    isLoading={isLoading}
                    canManageCatalog={canManageCatalog}
                />

                {isLoading && subjects.length === 0 && (
                    <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                    </div>
                )}

                {isError && (
                    <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                        Error loading subjects. Please try again.
                    </div>
                )}
            </div>

            <OfferSubjectDialog open={offerSubjectOpen} onOpenChange={setOfferSubjectOpen} />
        </div>
    );
}

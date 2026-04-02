'use client';

import { useState } from 'react';
import { useDebounce, useSubjectsQuery } from '@sentinel/hooks';
import {
    AddSubjectDialog,
    BulkUploadDialog,
    masterColumns,
    OfferSubjectDialog,
    SubjectsList,
} from '@/app/(protected)/(admin)/subjects/_components';
import { Button, PageHeader, Separator } from '@sentinel/ui';
import { Plus } from 'lucide-react';

export default function AdminSubjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [offerSubjectOpen, setOfferSubjectOpen] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: subjects = [], isLoading, isError } = useSubjectsQuery(debouncedSearch || undefined);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Subject Management"
                description="Manage the central subject catalog used when creating term-based offerings."
            >
                <BulkUploadDialog />
                <Button
                    variant="outline"
                    onClick={() => setOfferSubjectOpen(true)}
                    className="border-[#323d8f]/20 text-[#323d8f] hover:bg-[#323d8f]/5"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Offer Subject
                </Button>
                <AddSubjectDialog />
            </PageHeader>
            <Separator />

            <div className="relative">
                {/* Always render SubjectsList to keep search bar mounted and focused */}
                <SubjectsList
                    subjects={subjects}
                    columns={masterColumns}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    isLoading={isLoading}
                />

                {/* Subtle loading overlay only for initial empty state */}
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

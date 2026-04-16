'use client';

import { useState } from 'react';
import { useActivePermissions } from '@sentinel/hooks';
import { Button, EmptyState } from '@sentinel/ui';
import { OfferSubjectDialog } from '../dialogs/offer-subject-dialog';

interface OfferedSubjectsEmptyStateProps {
    searchTerm?: string;
}

export function OfferedSubjectsEmptyState({ searchTerm }: OfferedSubjectsEmptyStateProps) {
    const { hasPermission } = useActivePermissions();
    const [offerOpen, setOfferOpen] = useState(false);
    const canOfferSubject = hasPermission('subject_offerings:offer');

    return (
        <>
            <EmptyState
                icon="🗂️"
                title={searchTerm ? 'No results found' : 'No offered subjects yet'}
                description={
                    searchTerm
                        ? `We couldn't find any offered subjects matching "${searchTerm}".`
                        : 'Create a term-based offering to start assigning subjects to departments, courses, year levels, and sections.'
                }
                action={
                    !searchTerm && canOfferSubject ? (
                        <Button
                            type="button"
                            onClick={() => setOfferOpen(true)}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            Offer Subject
                        </Button>
                    ) : null
                }
            />

            {canOfferSubject ? (
                <OfferSubjectDialog open={offerOpen} onOpenChange={setOfferOpen} />
            ) : null}
        </>
    );
}

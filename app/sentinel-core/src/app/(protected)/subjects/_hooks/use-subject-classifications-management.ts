'use client';

import { useState } from 'react';
import { type SubjectClassification } from '@sentinel/shared/types';

export function useSubjectClassificationsManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedClassification, setSelectedClassification] =
        useState<SubjectClassification | null>(null);
    const [selectedOfferingClassification, setSelectedOfferingClassification] =
        useState<SubjectClassification | null>(null);

    function handleCreateOpen() {
        setSelectedClassification(null);
        setDialogOpen(true);
    }

    function handleEditOpen(classification: SubjectClassification) {
        setSelectedClassification(classification);
        setDialogOpen(true);
    }

    function handleOfferOpen(classification: SubjectClassification) {
        setSelectedOfferingClassification(classification);
    }

    return {
        searchTerm,
        setSearchTerm,
        dialogOpen,
        setDialogOpen,
        selectedClassification,
        selectedOfferingClassification,
        setSelectedOfferingClassification,
        handleCreateOpen,
        handleEditOpen,
        handleOfferOpen,
    };
}

'use client';

import * as React from 'react';
import { useUserSearch, useAssignOfferedSubjectMutation } from '@sentinel/hooks';

/**
 * Custom hook to manage the state and actions of the AssignSubjectToInstructorDialog.
 *
 * @param subjectOfferingId The offering ID or array of offering IDs to assign.
 * @param onSuccess Callback executed upon successful assignment.
 */
export function useAssignSubjectToInstructor(
    subjectOfferingId: string | string[],
    onSuccess: () => void,
) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [openCombobox, setOpenCombobox] = React.useState(false);
    const [selectedInstructorId, setSelectedInstructorId] = React.useState<string | null>(null);
    const [selectedInstructor, setSelectedInstructor] = React.useState<any | null>(null);

    // Call the server-side search hook
    const { users: searchedInstructors, isLoading: isSearchLoading } = useUserSearch(searchTerm, {
        role: ['instructor'],
    });

    const assignMutation = useAssignOfferedSubjectMutation();
    const isPending = assignMutation.isPending;

    // Format display name
    const selectedName = React.useMemo(() => {
        if (!selectedInstructor) return '';
        return (
            [selectedInstructor.firstName, selectedInstructor.lastName].filter(Boolean).join(' ') ||
            selectedInstructor.email
        );
    }, [selectedInstructor]);

    // Track what is currently displayed in the input field
    const [displayValue, setDisplayValue] = React.useState('');

    // Synchronize display value with selection when dropdown is closed/opened
    React.useEffect(() => {
        if (!openCombobox) {
            setDisplayValue(selectedInstructor ? selectedName : '');
            setSearchTerm('');
        }
    }, [openCombobox, selectedInstructor, selectedName]);

    const handleReset = React.useCallback(() => {
        setSelectedInstructorId(null);
        setSelectedInstructor(null);
        setDisplayValue('');
        setSearchTerm('');
    }, []);

    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDisplayValue(val);
        setSearchTerm(val);

        if (!val) {
            setSelectedInstructorId(null);
            setSelectedInstructor(null);
        }
    }, []);

    const handleFocus = React.useCallback(() => {
        setOpenCombobox(true);
        setDisplayValue(searchTerm);
    }, [searchTerm]);

    const handleAssign = React.useCallback(async () => {
        if (!selectedInstructorId) return;
        const ids = Array.isArray(subjectOfferingId) ? subjectOfferingId : [subjectOfferingId];
        try {
            await Promise.all(
                ids.map((id) =>
                    assignMutation.mutateAsync({
                        instructorId: selectedInstructorId,
                        subjectOfferingId: id,
                    }),
                ),
            );
            onSuccess();
        } catch (err) {
            // Toast notification is fired by the hook
        }
    }, [selectedInstructorId, subjectOfferingId, assignMutation, onSuccess]);

    return {
        searchTerm,
        setSearchTerm,
        openCombobox,
        setOpenCombobox,
        selectedInstructorId,
        setSelectedInstructorId,
        selectedInstructor,
        setSelectedInstructor,
        searchedInstructors,
        isSearchLoading,
        isPending,
        selectedName,
        displayValue,
        setDisplayValue,
        handleReset,
        handleInputChange,
        handleFocus,
        handleAssign,
    };
}

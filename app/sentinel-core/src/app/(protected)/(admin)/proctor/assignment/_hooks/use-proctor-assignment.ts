'use client';

import { useState } from 'react';
import { InstructorAssignment } from '@sentinel/shared/types';

interface UseProctorAssignmentProps {
    assignments: InstructorAssignment[];
}

export function useProctorAssignment({ assignments }: UseProctorAssignmentProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingAssignment, setEditingAssignment] = useState<InstructorAssignment | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Filter logic (simple client-side for now)
    const filteredAssignments = assignments.filter(
        (assignment) =>
            assignment.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.examName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleEdit = (assignment: InstructorAssignment) => {
        setEditingAssignment(assignment);
    };

    const handleCreate = () => {
        setEditingAssignment(null);
        setIsCreateDialogOpen(true);
    };

    const handleCloseDialog = (open: boolean) => {
        if (!open) {
            setEditingAssignment(null);
            setIsCreateDialogOpen(false);
        }
    };

    return {
        searchQuery,
        setSearchQuery,
        filteredAssignments,
        editingAssignment,
        isCreateDialogOpen,
        handleEdit,
        handleCreate,
        handleCloseDialog,
    };
}

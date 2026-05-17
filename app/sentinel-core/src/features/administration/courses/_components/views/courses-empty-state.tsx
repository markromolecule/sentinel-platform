'use client';

import { EmptyState } from '@sentinel/ui';
import { AddCourseDialog } from '../dialogs/add-course-dialog';

interface CoursesEmptyStateProps {
    searchTerm?: string;
}

/**
 * CoursesEmptyState component that renders a friendly empty dashboard state.
 * Allows adding a new course directly from the blank screen if there is no active search keyword.
 */
export function CoursesEmptyState({ searchTerm }: CoursesEmptyStateProps) {
    return (
        <EmptyState
            icon="📚"
            title={searchTerm ? 'No results found' : 'No courses added'}
            description={
                searchTerm
                    ? `We couldn't find any courses matching "${searchTerm}".`
                    : 'Add courses to the system to start managing academic programs.'
            }
            action={!searchTerm && <AddCourseDialog />}
        />
    );
}

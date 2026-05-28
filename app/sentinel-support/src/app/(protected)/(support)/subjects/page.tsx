'use client';

import { SubjectsView } from './_components/views/subjects-view';
import { SubjectPageShell } from './_components/layout';

/**
 * SupportSubjectsPage renders the main subject listing page within sentinel-support,
 * wrapped in the SubjectPageShell layout.
 */
export default function SupportSubjectsPage() {
    return (
        <SubjectPageShell
            title="Subject List"
            description="Browse and manage the institutional subject catalog."
        >
            <SubjectsView />
        </SubjectPageShell>
    );
}


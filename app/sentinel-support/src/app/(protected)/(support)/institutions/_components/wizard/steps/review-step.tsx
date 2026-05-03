import { Alert, AlertDescription } from '@sentinel/ui';
import type { WizardDraft } from '../_types';
import { SectionHeader } from '../shared-ui';
import { SummaryCard } from '../summary-card';

export function ReviewStep({
    summary,
}: {
    summary: {
        departments: number;
        courses: number;
        terms: number;
        subjects: number;
        namingConventions: number;
    };
}) {
    return (
        <section className="space-y-5">
            <SectionHeader title="Review and publish" countLabel="Ready" />
            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard label="Departments" value={summary.departments} />
                <SummaryCard label="Courses" value={summary.courses} />
                <SummaryCard label="Terms" value={summary.terms} />
                <SummaryCard label="Subjects" value={summary.subjects} />
                <SummaryCard label="Naming Conventions" value={summary.namingConventions} />
            </div>
            <Alert>
                <AlertDescription>
                    Publish creates the institution first, then template catalog records and naming
                    conventions. Rooms and sections are no longer created during institution setup.
                </AlertDescription>
            </Alert>
        </section>
    );
}

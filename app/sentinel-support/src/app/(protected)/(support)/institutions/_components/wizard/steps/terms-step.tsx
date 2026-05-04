import { Input, Switch } from '@sentinel/ui';
import { createClientId } from '../_utils';
import type { WizardDraft } from '../_types';
import { RowActions, RowsSection } from '../rows-section';
import { WizardTable, WizardTableRow } from '../wizard-table';

export function TermsStep({
    draft,
    summary,
    updateDraft,
}: {
    draft: WizardDraft;
    summary: { terms: number };
    updateDraft: (updater: (current: WizardDraft) => WizardDraft) => void;
}) {
    return (
        <RowsSection
            title="Academic terms"
            countLabel={`${summary.terms} configured`}
            onAdd={() =>
                updateDraft((current) => ({
                    ...current,
                    terms: [
                        ...current.terms,
                        {
                            clientId: createClientId(),
                            academicYear: '',
                            semester: '',
                            isActive: true,
                            startDate: '',
                            endDate: '',
                        },
                    ],
                }))
            }
        >
            <WizardTable
                columns={['Academic year', 'Term name', 'Start date', 'End date', 'Active', '']}
                templateColumns="minmax(140px,1fr)_minmax(140px,1fr)_160px_160px_80px_48px"
            >
                {draft.terms.map((term, index) => (
                    <WizardTableRow
                        key={term.clientId}
                        templateColumns="minmax(140px,1fr)_minmax(140px,1fr)_160px_160px_80px_48px"
                    >
                        <Input
                            value={term.academicYear}
                            placeholder="2025-2026"
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    terms: current.terms.map((t, i) =>
                                        i === index ? { ...t, academicYear: event.target.value } : t,
                                    ),
                                }))
                            }
                        />
                        <Input
                            value={term.semester}
                            placeholder="1st Semester"
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    terms: current.terms.map((t, i) =>
                                        i === index ? { ...t, semester: event.target.value } : t,
                                    ),
                                }))
                            }
                        />
                        <Input
                            type="date"
                            value={term.startDate}
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    terms: current.terms.map((t, i) =>
                                        i === index ? { ...t, startDate: event.target.value } : t,
                                    ),
                                }))
                            }
                        />
                        <Input
                            type="date"
                            value={term.endDate}
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    terms: current.terms.map((t, i) =>
                                        i === index ? { ...t, endDate: event.target.value } : t,
                                    ),
                                }))
                            }
                        />
                        <div className="flex justify-center">
                            <Switch
                                checked={term.isActive}
                                onCheckedChange={(checked) =>
                                    updateDraft((current) => ({
                                        ...current,
                                        terms: current.terms.map((t, i) =>
                                            i === index ? { ...t, isActive: checked } : t,
                                        ),
                                    }))
                                }
                            />
                        </div>
                        <RowActions
                            disabled={draft.terms.length === 1}
                            onRemove={() =>
                                updateDraft((current) => ({
                                    ...current,
                                    terms: current.terms.filter(
                                        (_, rowIndex) => rowIndex !== index,
                                    ),
                                }))
                            }
                        />
                    </WizardTableRow>
                ))}
            </WizardTable>
        </RowsSection>
    );
}

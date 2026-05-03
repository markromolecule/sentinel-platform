import { Input } from '@sentinel/ui';
import { createClientId } from '../_utils';
import type { WizardDraft } from '../_types';
import { RowActions, RowsSection } from '../rows-section';
import { WizardTable, WizardTableRow } from '../wizard-table';

export function DepartmentsStep({
    draft,
    summary,
    updateDraft,
}: {
    draft: WizardDraft;
    summary: { departments: number };
    updateDraft: (updater: (current: WizardDraft) => WizardDraft) => void;
}) {
    return (
        <RowsSection
            title="Departments"
            countLabel={`${summary.departments} configured`}
            onAdd={() =>
                updateDraft((current) => ({
                    ...current,
                    departments: [
                        ...current.departments,
                        { clientId: createClientId(), name: '', code: '' },
                    ],
                }))
            }
        >
            <WizardTable
                columns={['Department name', 'Code', '']}
                templateColumns="minmax(200px,1fr)_160px_48px"
            >
                {draft.departments.map((department, index) => (
                    <WizardTableRow
                        key={department.clientId}
                        templateColumns="minmax(200px,1fr)_160px_48px"
                    >
                        <Input
                            value={department.name}
                            placeholder="School of Engineering, Computing, and Architecture"
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    departments: current.departments.map((d, i) =>
                                        i === index ? { ...d, name: event.target.value } : d,
                                    ),
                                }))
                            }
                        />
                        <Input
                            value={department.code}
                            placeholder="SECA"
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    departments: current.departments.map((d, i) =>
                                        i === index ? { ...d, code: event.target.value } : d,
                                    ),
                                }))
                            }
                        />

                        <RowActions
                            disabled={draft.departments.length === 1}
                            onRemove={() =>
                                updateDraft((current) => ({
                                    ...current,
                                    departments: current.departments.filter(
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

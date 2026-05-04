import { Input, NativeSelect, NativeSelectOption } from '@sentinel/ui';
import { createClientId } from '../../_utils';
import type { WizardDraft } from '../../_types';
import { RowActions, RowsSection } from '../rows-section';
import { WizardTable, WizardTableRow } from '../wizard-table';

export function CoursesStep({
    draft,
    summary,
    updateDraft,
}: {
    draft: WizardDraft;
    summary: { courses: number };
    updateDraft: (updater: (current: WizardDraft) => WizardDraft) => void;
}) {
    const departmentOptions = draft.departments.filter((department) => department.name.trim());

    return (
        <RowsSection
            title="Courses"
            countLabel={`${summary.courses} configured`}
            onAdd={() =>
                updateDraft((current) => ({
                    ...current,
                    courses: [
                        ...current.courses,
                        {
                            clientId: createClientId(),
                            title: '',
                            code: '',
                            departmentClientId: '',
                        },
                    ],
                }))
            }
        >
            <WizardTable
                columns={['Course title', 'Code', 'Department assignment', '']}
                templateColumns="minmax(200px,1fr)_160px_240px_48px"
            >
                {draft.courses.map((course, index) => (
                    <WizardTableRow
                        key={course.clientId}
                        templateColumns="minmax(200px,1fr)_160px_240px_48px"
                    >
                        <Input
                            value={course.title}
                            placeholder="BS Computer Science"
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    courses: current.courses.map((c, i) =>
                                        i === index ? { ...c, title: event.target.value } : c,
                                    ),
                                }))
                            }
                        />
                        <Input
                            value={course.code}
                            placeholder="BSCS"
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    courses: current.courses.map((c, i) =>
                                        i === index ? { ...c, code: event.target.value } : c,
                                    ),
                                }))
                            }
                        />
                        <NativeSelect
                            value={course.departmentClientId}
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    courses: current.courses.map((c, i) =>
                                        i === index
                                            ? { ...c, departmentClientId: event.target.value }
                                            : c,
                                    ),
                                }))
                            }
                        >
                            <NativeSelectOption value="">Select department</NativeSelectOption>
                            {departmentOptions.map((department) => (
                                <NativeSelectOption
                                    key={department.clientId}
                                    value={department.clientId}
                                >
                                    {department.name}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        <RowActions
                            disabled={draft.courses.length === 1}
                            onRemove={() =>
                                updateDraft((current) => ({
                                    ...current,
                                    courses: current.courses.filter(
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

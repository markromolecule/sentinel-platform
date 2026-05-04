import { Label, NativeSelect, NativeSelectOption } from '@sentinel/ui';
import type { InstitutionKind, WizardDraft, SimpleInstitution } from '../../_types';
import { LabeledInput, SectionHeader } from '../shared-ui';

export function IdentityStep({
    draft,
    institutions,
    updateDraft,
}: {
    draft: WizardDraft;
    institutions: SimpleInstitution[];
    updateDraft: (updater: (current: WizardDraft) => WizardDraft) => void;
}) {
    const parentOptions = institutions.filter(
        (institution) => institution.institutionKind !== 'CHILD',
    );

    return (
        <section className="space-y-5">
            <SectionHeader title="Identity" countLabel="Required" />
            <div className="grid gap-4 md:grid-cols-2">
                <LabeledInput
                    label="Institution name"
                    value={draft.identity.name}
                    placeholder="National University"
                    onChange={(value) =>
                        updateDraft((current) => ({
                            ...current,
                            identity: { ...current.identity, name: value },
                        }))
                    }
                />
                <LabeledInput
                    label="Code"
                    value={draft.identity.code}
                    placeholder="NU"
                    onChange={(value) =>
                        updateDraft((current) => ({
                            ...current,
                            identity: { ...current.identity, code: value },
                        }))
                    }
                />
                <div className="space-y-2">
                    <Label>Institution Type</Label>
                    <NativeSelect
                        className="w-full"
                        value={draft.identity.institutionKind}
                        onChange={(event) =>
                            updateDraft((current) => ({
                                ...current,
                                identity: {
                                    ...current.identity,
                                    institutionKind: event.target.value as InstitutionKind,
                                    parentInstitutionId:
                                        event.target.value === 'CHILD'
                                            ? current.identity.parentInstitutionId
                                            : '',
                                },
                            }))
                        }
                    >
                        <NativeSelectOption value="PARENT">Parent</NativeSelectOption>
                        <NativeSelectOption value="CHILD">Branch</NativeSelectOption>
                        <NativeSelectOption value="STANDALONE">Standalone</NativeSelectOption>
                    </NativeSelect>
                </div>

                {draft.identity.institutionKind === 'CHILD' ? (
                    <div className="space-y-2">
                        <Label>Parent institution</Label>
                        <NativeSelect
                            className="w-full"
                            value={draft.identity.parentInstitutionId}
                            onChange={(event) =>
                                updateDraft((current) => ({
                                    ...current,
                                    identity: {
                                        ...current.identity,
                                        parentInstitutionId: event.target.value,
                                    },
                                }))
                            }
                        >
                            <NativeSelectOption value="">Select parent</NativeSelectOption>
                            {parentOptions.map((institution) => (
                                <NativeSelectOption key={institution.id} value={institution.id}>
                                    {institution.name}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

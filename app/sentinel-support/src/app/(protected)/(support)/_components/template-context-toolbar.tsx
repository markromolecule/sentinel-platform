'use client';

import { Institution } from '@sentinel/shared/types';
import { Badge, Label, NativeSelect, NativeSelectOption } from '@sentinel/ui';

type TemplateContextToolbarProps = {
    institutions: Institution[];
    selectedInstitutionId: string;
    onInstitutionChange: (institutionId: string) => void;
};

export function TemplateContextToolbar({
    institutions,
    selectedInstitutionId,
    onInstitutionChange,
}: TemplateContextToolbarProps) {
    const selectedInstitution = institutions.find(
        (institution) => institution.id === selectedInstitutionId,
    );

    return (
        <div className="border-border bg-background flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
                <Label>Parent Template Context</Label>
                <NativeSelect
                    className="w-full min-w-[280px]"
                    value={selectedInstitutionId}
                    onChange={(event) => onInstitutionChange(event.target.value)}
                >
                    <NativeSelectOption value="">All institutions</NativeSelectOption>
                    {institutions.map((institution) => (
                        <NativeSelectOption key={institution.id} value={institution.id}>
                            {institution.name}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
            </div>
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                    {selectedInstitution?.institutionKind ?? 'All Contexts'}
                </Badge>
                {selectedInstitution?.parentInstitutionId ? (
                    <Badge variant="outline">Branch effective data</Badge>
                ) : (
                    <Badge variant="outline">Template data</Badge>
                )}
            </div>
        </div>
    );
}

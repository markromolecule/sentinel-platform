'use client';

import { Badge } from '@sentinel/ui';

export type InheritanceStatusRecord = {
    inheritanceStatus?: string | null;
    isInherited?: boolean | null;
    isOverridden?: boolean | null;
    isLocal?: boolean | null;
    isHidden?: boolean | null;
    institutionName?: string | null;
};

export function getInheritanceStatusLabel(record: InheritanceStatusRecord) {
    if (record.isHidden || record.inheritanceStatus === 'HIDDEN') {
        return 'Hidden';
    }

    if (record.isOverridden || record.inheritanceStatus === 'OVERRIDDEN') {
        return 'Overridden';
    }

    if (record.isInherited || record.inheritanceStatus === 'INHERITED') {
        return 'Inherited';
    }

    return 'Local';
}

export function isParentOwnedRecord(record: InheritanceStatusRecord) {
    return getInheritanceStatusLabel(record) === 'Inherited';
}

export function InheritanceStatusBadge({ record }: { record: InheritanceStatusRecord }) {
    const label = getInheritanceStatusLabel(record);
    const variant =
        label === 'Inherited' ? 'secondary' : label === 'Overridden' ? 'default' : 'outline';

    return (
        <div className="flex flex-col gap-1">
            <Badge
                variant={variant}
                className={
                    label === 'Overridden'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : label === 'Inherited'
                          ? 'border-[#323d8f]/20 bg-[#323d8f]/5 text-[#323d8f]'
                          : undefined
                }
            >
                {label}
            </Badge>
            {record.institutionName && (
                <span className="text-muted-foreground text-[10px] leading-tight">
                    {record.institutionName}
                </span>
            )}
        </div>
    );
}

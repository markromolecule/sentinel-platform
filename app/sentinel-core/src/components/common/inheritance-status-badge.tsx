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
    if (!record.institutionName) {
        return <span className="text-muted-foreground text-sm">—</span>;
    }

    return (
        <span className="text-sm font-medium text-foreground">
            {record.institutionName}
        </span>
    );
}

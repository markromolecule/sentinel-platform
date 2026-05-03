'use client';

import { Badge } from '@sentinel/ui';

export type InheritanceStatusRecord = {
    inheritanceStatus?: string | null;
    isInherited?: boolean | null;
    isOverridden?: boolean | null;
    isLocal?: boolean | null;
    isHidden?: boolean | null;
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
        label === 'Inherited' ? 'outline' : label === 'Overridden' ? 'secondary' : 'default';

    return <Badge variant={variant}>{label}</Badge>;
}

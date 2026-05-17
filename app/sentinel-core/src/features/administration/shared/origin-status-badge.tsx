'use client';

import { Badge } from '@sentinel/ui';

export type OriginStatusInput = {
    inheritanceStatus?: string | null;
    isInherited?: boolean;
    isOverridden?: boolean;
    isLocal?: boolean;
};

export function getOriginStatusLabel(record: OriginStatusInput) {
    if (record.isOverridden || record.inheritanceStatus === 'OVERRIDDEN') {
        return 'Overridden';
    }

    if (record.isInherited || record.inheritanceStatus === 'INHERITED') {
        return 'Inherited';
    }

    return 'Local';
}

export function OriginStatusBadge({ record }: { record: OriginStatusInput }) {
    const label = getOriginStatusLabel(record);
    const variant =
        label === 'Inherited' ? 'outline' : label === 'Overridden' ? 'secondary' : 'default';

    return <Badge variant={variant}>{label}</Badge>;
}

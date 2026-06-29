import type { AccessControlRole } from '@sentinel/shared/types';
import { parseCount, parseUuidArray, toNullableDate } from '../data/get-roles';

export function normalizeRoleName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, '_');
}

export function mapRoleRow(row: any): AccessControlRole {
    return {
        id: row.role_id,
        name: row.role_name,
        slug: row.slug ?? null,
        description: row.description,
        isSystem: Boolean(row.is_system),
        domainScope: row.domain_scope ?? [],
        isActive: Boolean(row.is_active),
        assignableBy: row.assignable_by ?? [],
        permissionIds: parseUuidArray(row.permissionIds),
        permissionCount: parseCount(row.permissionCount),
        assignmentCount: parseCount(row.assignmentCount),
        createdAt: toNullableDate(row.created_at),
        updatedAt: toNullableDate(row.updated_at),
    };
}

import { Role, Permission } from "@sentinel/shared/mock-data";

export type RoleWithPermissions = Role & {
    permissionDetails: Permission[];
};

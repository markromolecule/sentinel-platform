'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Textarea,
    Checkbox,
    Switch,
} from '@sentinel/ui';
import { accessControlRoleBodySchema, type AccessControlRoleBodySchemaValues } from '@sentinel/shared';
import type { AccessControlRole } from '@sentinel/shared/types';

export interface RoleFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: AccessControlRole | null;
    roles?: AccessControlRole[];
    isPending?: boolean;
    onSubmit: (payload: AccessControlRoleBodySchemaValues) => void;
}

const DOMAIN_OPTIONS = [
    { value: 'support', label: 'Support Operations (support.sentinelph.tech)' },
    { value: 'core', label: 'Core System (core.sentinelph.tech)' },
    { value: 'app', label: 'End-User Application (app.sentinelph.tech)' },
];

/**
 * RoleForm dialog using react-hook-form and Zod validation.
 * Enables CRUD operations for dynamic and domain-scoped roles.
 */
export function RoleForm({
    open,
    onOpenChange,
    role,
    roles = [],
    isPending,
    onSubmit,
}: RoleFormProps) {
    const isEditMode = Boolean(role);
    const isSystemRole = Boolean(role?.isSystem);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<AccessControlRoleBodySchemaValues>({
        resolver: zodResolver(accessControlRoleBodySchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            domainScope: ['app'],
            isActive: true,
            assignableBy: [],
        },
    });

    const watchName = watch('name');

    // Auto-derive slug from name for custom roles when name changes and slug isn't manually edited
    useEffect(() => {
        if (!isEditMode && watchName) {
            const derivedSlug = watchName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');
            setValue('slug', derivedSlug, { shouldValidate: true });
        }
    }, [watchName, isEditMode, setValue]);

    // Reset values when role changes or modal opens/closes
    useEffect(() => {
        if (!open) return;

        if (role) {
            reset({
                name: role.name,
                slug: role.slug || '',
                description: role.description || '',
                domainScope: role.domainScope,
                isActive: role.isActive,
                assignableBy: role.assignableBy || [],
            });
        } else {
            reset({
                name: '',
                slug: '',
                description: '',
                domainScope: ['app'],
                isActive: true,
                assignableBy: [],
            });
        }
    }, [open, role, reset]);

    const handleFormSubmit = (data: AccessControlRoleBodySchemaValues) => {
        onSubmit({
            ...data,
            slug: data.slug || null,
            description: data.description || null,
        });
    };

    // Exclude the current role from parent assignment options
    const assignableRoles = roles.filter((r) => !role || r.id !== role.id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? 'Edit Dynamic Role' : 'Create Dynamic Role'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? 'Refine the dynamic role definition, domain scopes, and assignment privileges.'
                                : 'Configure a new dynamic role with custom identifiers, active domain scopes, and restrictions.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
                        {/* Role Name */}
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Display Name</Label>
                            <Input
                                id="role-name"
                                placeholder="E.g. Academic Moderator"
                                disabled={isSystemRole || isPending}
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-destructive text-xs font-semibold">
                                    {errors.name.message}
                                </p>
                            )}
                            {isSystemRole && (
                                <p className="text-muted-foreground text-xs leading-relaxed font-medium opacity-70">
                                    System seeded role display names are protected and cannot be changed.
                                </p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="role-slug">Role Slug</Label>
                            <Input
                                id="role-slug"
                                placeholder="E.g. academic-moderator"
                                disabled={isSystemRole || isPending}
                                className="font-mono"
                                {...register('slug')}
                            />
                            {errors.slug && (
                                <p className="text-destructive text-xs font-semibold">
                                    {errors.slug.message}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="role-description">Description</Label>
                            <Textarea
                                id="role-description"
                                placeholder="E.g. Manages and reviews examination settings for classrooms."
                                disabled={isPending}
                                rows={3}
                                className="resize-none"
                                {...register('description')}
                            />
                            {errors.description && (
                                <p className="text-destructive text-xs font-semibold">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* Domain Scope (Checkboxes) */}
                        <div className="space-y-2">
                            <Label>Domain Scope Scope Boundaries (Min 1 required)</Label>
                            <Controller
                                name="domainScope"
                                control={control}
                                render={({ field }) => (
                                    <div className="grid gap-2 border p-3 bg-muted/5 rounded-md">
                                        {DOMAIN_OPTIONS.map((option) => {
                                            const checked = field.value?.includes(option.value) ?? false;
                                            return (
                                                <div key={option.value} className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={`domain-${option.value}`}
                                                        checked={checked}
                                                        disabled={isSystemRole || isPending}
                                                        onCheckedChange={(isChecked) => {
                                                            const newValue = isChecked
                                                                ? [...(field.value || []), option.value]
                                                                : (field.value || []).filter((v) => v !== option.value);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`domain-${option.value}`}
                                                        className="cursor-pointer text-foreground/90 select-none text-sm"
                                                    >
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            />
                            {errors.domainScope && (
                                <p className="text-destructive text-xs font-semibold">
                                    {errors.domainScope.message}
                                </p>
                            )}
                        </div>

                        {/* Assignable By Boundaries */}
                        <div className="space-y-2">
                            <Label>Assignable By (Parent role boundaries)</Label>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Select which roles are permitted to assign this role. If none are selected, the role inherits default Option A hierarchy rules.
                            </p>
                            <Controller
                                name="assignableBy"
                                control={control}
                                render={({ field }) => (
                                    <div className="max-h-[160px] overflow-y-auto border p-3 bg-muted/5 rounded-md space-y-2">
                                        {assignableRoles.length > 0 ? (
                                            assignableRoles.map((otherRole) => {
                                                const otherSlug = otherRole.slug || otherRole.name.toLowerCase();
                                                const checked = field.value?.includes(otherSlug) ?? false;
                                                return (
                                                    <div key={otherRole.id} className="flex items-center space-x-3">
                                                        <Checkbox
                                                            id={`assignable-${otherRole.id}`}
                                                            checked={checked}
                                                            disabled={isPending}
                                                            onCheckedChange={(isChecked) => {
                                                                const newValue = isChecked
                                                                    ? [...(field.value || []), otherSlug]
                                                                    : (field.value || []).filter((v) => v !== otherSlug);
                                                                field.onChange(newValue);
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`assignable-${otherRole.id}`}
                                                            className="cursor-pointer text-foreground/90 select-none text-sm capitalize"
                                                        >
                                                            {otherRole.name}
                                                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                                                                ({otherSlug})
                                                            </span>
                                                        </Label>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-muted-foreground text-xs italic text-center py-4">
                                                No other roles available to configure.
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Status (Active / Inactive Switch) */}
                        <div className="flex items-center justify-between border p-3 bg-muted/5 rounded-md">
                            <div className="space-y-1">
                                <Label htmlFor="role-status">Active Status</Label>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Inactive roles are hidden from the Role Matrix and assignment selections.
                                </p>
                            </div>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        id="role-status"
                                        checked={field.value}
                                        disabled={isSystemRole || isPending}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !isValid}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            {isPending
                                ? 'Saving...'
                                : isEditMode
                                    ? 'Update Role'
                                    : 'Create Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

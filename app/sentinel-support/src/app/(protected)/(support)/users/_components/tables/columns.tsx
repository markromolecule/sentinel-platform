'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { User } from '@sentinel/shared/types';
import { DataTableColumnHeader } from '@sentinel/ui';
import { AdministratorActionsCell } from './administrator-actions-cell';
import { StatusBadge } from '@/components/common/status-badge';
import type { AdministratorRole } from '@/app/(protected)/(support)/users/_lib/administrator-role-config';

export const columns = (
    onEdit: (admin: User) => void,
    onDelete: (admin: User) => void,
): ColumnDef<User>[] => [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
            cell: ({ row }) => {
                const admin = row.original;
                const fullName = admin.name || `${admin.firstName} ${admin.lastName}`;
                return <div className="font-medium">{fullName}</div>;
            },
        },
        {
            accessorKey: 'role',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
            cell: ({ row }) => {
                const role = row.getValue<string>('role');
                return (
                    <div className="capitalize text-muted-foreground">
                        {role === 'superadmin' ? 'Superadmin' : 'Support'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
        },
        {
            accessorFn: (row) => row.institution ?? '',
            id: 'institution',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground">{row.original.institution || '—'}</div>
            ),
        },
        {
            accessorFn: (row) => row.department ?? '',
            id: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground">{row.original.department || '—'}</div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.getValue<string>('status');
                const normalizedStatus = status.toLowerCase();
                const label = normalizedStatus === 'active' ? 'Online' : 'Offline';

                return <StatusBadge status={normalizedStatus} label={label} />;
            },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
            cell: ({ row }) => {
                const date = row.getValue<string | Date>('createdAt');
                if (!date) return <div className="text-muted-foreground">—</div>;
                return (
                    <div className="text-muted-foreground">{format(new Date(date), 'MMM d, yyyy')}</div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <AdministratorActionsCell
                    administrator={row.original}
                    role={row.original.role as AdministratorRole}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ),
        },
    ];

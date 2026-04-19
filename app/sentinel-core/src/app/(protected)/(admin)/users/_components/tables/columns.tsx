'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User, UserRole } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';
import { Checkbox } from '@sentinel/ui';
import { DataTableColumnHeader } from '@sentinel/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@sentinel/ui';
import { StatusBadge } from '@/components/common/status-badge';
import { UserActionCell } from '@/app/(protected)/(admin)/users/_components/tables/user-action-cell';

export const columns = (
    onEdit: (user: User) => void,
    onDelete: (user: User) => void,
    onlineUserIds: Set<string>,
    courseCodeById: Map<string, string>,
): ColumnDef<User>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="User Identity" />,
        cell: ({ row }) => {
            const user = row.original;
            const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl ?? ''} alt={user.firstName ?? 'User'} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">
                            {user.firstName ?? ''} {user.lastName ?? ''}
                        </span>
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                    </div>
                </div>
            );
        },
    },
    {
        id: 'role',
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => {
            const role = row.getValue('role') as UserRole;

            const roleColors: Record<UserRole, string> = {
                admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
                superadmin:
                    'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800',
                proctor:
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                instructor:
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                disciplinary_officer:
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
                support:
                    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
                student:
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
            };

            return (
                <Badge variant="outline" className={`capitalize ${roleColors[role]}`}>
                    {role}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'institution',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
        cell: ({ row }) => {
            const institution = row.getValue('institution') as string;
            return <span className="text-sm">{institution || '-'}</span>;
        },
    },
    {
        accessorKey: 'departmentCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => {
            const department =
                (row.getValue('departmentCode') as string) ?? row.original.department;
            return <span className="line-clamp-2 text-sm">{department || '-'}</span>;
        },
    },
    {
        id: 'course',
        accessorFn: (user) => {
            const resolvedCourseIds = user.courseIds?.length
                ? user.courseIds
                : user.courseId
                  ? [user.courseId]
                  : [];

            const courseCodes = Array.from(
                new Set(
                    resolvedCourseIds
                        .map((courseId) => courseCodeById.get(courseId)?.trim())
                        .filter((code): code is string => Boolean(code)),
                ),
            );

            return courseCodes.join(', ');
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
        cell: ({ row }) => {
            const course = row.getValue('course') as string;
            return <span className="line-clamp-2 text-sm">{course || '-'}</span>;
        },
    },
    {
        accessorKey: 'studentNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student No." />,
        cell: ({ row }) => {
            const user = row.original as User & { studentNo?: string };
            return <div className="font-mono text-sm">{user.studentNo || '-'}</div>;
        },
    },
    {
        accessorKey: 'employeeNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee No." />,
        cell: ({ row }) => {
            const user = row.original as User & { employeeNo?: string };
            return <div className="font-mono text-sm">{user.employeeNo || '-'}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const user = row.original;
            const isOnline = onlineUserIds.has(user.id);
            const status = isOnline ? 'active' : (row.getValue('status') as string);
            return <StatusBadge status={status} />;
        },
    },

    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date Created" />,
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string | Date;
            if (!date) return <span className="text-muted-foreground">-</span>;

            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            return <span className="text-sm">{formattedDate}</span>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const user = row.original;

            return <UserActionCell user={user} onEdit={onEdit} onDelete={onDelete} />;
        },
    },
];

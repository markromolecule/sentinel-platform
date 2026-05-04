'use client';

import { OriginStatusBadge, getOriginStatusLabel } from '../_components/origin-status-badge';
import { RevertPreviewDialog } from '../_components/revert-preview-dialog';
import { TemplateContextToolbar } from '../_components/template-context-toolbar';
import {
    isPermissionDeniedError,
    useCoursesQuery,
    useCreateCourseMutation,
    useDebounce,
    useDeleteCourseMutation,
    useDepartmentsQuery,
    useInstitutionsQuery,
    useUpdateCourseMutation,
} from '@sentinel/hooks';
import { Course } from '@sentinel/shared/types';
import {
    Button,
    DataTable,
    DataTableColumnHeader,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    NativeSelect,
    NativeSelectOption,
    PageHeader,
    PermissionDeniedState,
    Separator,
    Textarea,
} from '@sentinel/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Layers, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CourseSectionsDialog } from './_components/course-sections-dialog';

type CourseFormState = {
    id?: string;
    code: string;
    title: string;
    departmentId: string;
    description: string;
    isInherited?: boolean;
};

const emptyForm: CourseFormState = {
    code: '',
    title: '',
    departmentId: '',
    description: '',
};

export default function SupportCoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
    const [originFilter, setOriginFilter] = useState('ALL');
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<CourseFormState>(emptyForm);
    const [courseToRevert, setCourseToRevert] = useState<Course | null>(null);
    const [managedCourseId, setManagedCourseId] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: institutions = [] } = useInstitutionsQuery();
    const selectedInstitution = institutions.find(
        (institution) => institution.id === selectedInstitutionId,
    );
    const parentInstitutionId = selectedInstitution?.parentInstitutionId ?? '';
    const {
        data: courses = [],
        isLoading,
        isError,
        error,
    } = useCoursesQuery(debouncedSearch, selectedInstitutionId || undefined);
    const { data: parentCourses = [] } = useCoursesQuery(
        '',
        parentInstitutionId || undefined,
        Boolean(parentInstitutionId),
    );
    const { data: departments = [] } = useDepartmentsQuery('', selectedInstitutionId || undefined);
    const isViewDenied = isPermissionDeniedError(error, 'courses:view');

    const createCourseMutation = useCreateCourseMutation({
        onSuccess: () => {
            setFormOpen(false);
            setForm(emptyForm);
        },
    });
    const updateCourseMutation = useUpdateCourseMutation({
        onSuccess: () => {
            setFormOpen(false);
            setForm(emptyForm);
        },
    });
    const deleteCourseMutation = useDeleteCourseMutation();

    const filteredCourses = useMemo(
        () =>
            courses.filter((course) => {
                if (originFilter === 'ALL') return true;
                return getOriginStatusLabel(course).toUpperCase() === originFilter;
            }),
        [courses, originFilter],
    );
    const parentCourse = useMemo(
        () =>
            courseToRevert?.sourceRecordId
                ? parentCourses.find((course) => course.id === courseToRevert.sourceRecordId)
                : undefined,
        [courseToRevert, parentCourses],
    );

    const columns = useMemo<ColumnDef<Course>[]>(
        () => [
            {
                accessorKey: 'code',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
                cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
            },
            {
                accessorKey: 'title',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
            },
            {
                accessorKey: 'departmentName',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Department" />
                ),
                cell: ({ row }) => row.original.departmentName ?? '—',
            },
            {
                id: 'origin',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
                cell: ({ row }) => <OriginStatusBadge record={row.original} />,
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex justify-end gap-1">
                        {row.original.isOverridden ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCourseToRevert(row.original)}
                            >
                                Revert
                            </Button>
                        ) : null}
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Manage Sections"
                            onClick={() => setManagedCourseId(row.original.id)}
                        >
                            <Layers className="h-4 w-4 text-primary" />
                            <span className="sr-only">Manage sections</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setForm({
                                    id: row.original.id,
                                    code: row.original.code,
                                    title: row.original.title,
                                    departmentId: row.original.departmentId ?? '',
                                    description: row.original.description ?? '',
                                    isInherited: row.original.isInherited,
                                });
                                setFormOpen(true);
                            }}
                        >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit course</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (window.confirm(`Delete ${row.original.title}?`)) {
                                    deleteCourseMutation.mutate({
                                        id: row.original.id,
                                        institutionId: selectedInstitutionId || undefined,
                                    });
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete course</span>
                        </Button>
                    </div>
                ),
            },
        ],
        [
            deleteCourseMutation,
            selectedInstitutionId,
            setCourseToRevert,
            setForm,
            setFormOpen,
            setManagedCourseId,
        ],
    );

    function submitForm() {
        if (!form.code.trim() || !form.title.trim()) return;

        if (form.id) {
            if (
                form.isInherited &&
                !window.confirm(
                    'This inherited course will become a local override for the selected branch context.',
                )
            ) {
                return;
            }

            updateCourseMutation.mutate({
                id: form.id,
                payload: {
                    code: form.code.trim(),
                    title: form.title.trim(),
                    department_id: form.departmentId || null,
                    description: form.description.trim() || null,
                    institution_id: selectedInstitutionId || undefined,
                },
            });
            return;
        }

        createCourseMutation.mutate({
            code: form.code.trim(),
            title: form.title.trim(),
            departmentId: form.departmentId || null,
            description: form.description.trim() || null,
            institution_id: selectedInstitutionId || undefined,
        });
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title="Course Management" description="Manage parent template courses.">
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="courses" className="h-[360px]" />
            ) : (
                <>
                    <TemplateContextToolbar
                        institutions={institutions}
                        selectedInstitutionId={selectedInstitutionId}
                        onInstitutionChange={setSelectedInstitutionId}
                    />
                    <div className="flex justify-end">
                        <NativeSelect
                            className="w-[180px]"
                            value={originFilter}
                            onChange={(event) => setOriginFilter(event.target.value)}
                        >
                            <NativeSelectOption value="ALL">All origins</NativeSelectOption>
                            <NativeSelectOption value="INHERITED">Inherited</NativeSelectOption>
                            <NativeSelectOption value="LOCAL">Local</NativeSelectOption>
                            <NativeSelectOption value="OVERRIDDEN">Overridden</NativeSelectOption>
                        </NativeSelect>
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredCourses}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search courses..."
                        isLoading={isLoading}
                    />
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading courses. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{form.id ? 'Edit Course' : 'Add Course'}</DialogTitle>
                        <DialogDescription>
                            Course changes are scoped to the selected template context.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <Field
                            label="Code"
                            value={form.code}
                            onChange={(code) => setForm({ ...form, code })}
                        />
                        <Field
                            label="Title"
                            value={form.title}
                            onChange={(title) => setForm({ ...form, title })}
                        />
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <NativeSelect
                                className="w-full"
                                value={form.departmentId}
                                onChange={(event) =>
                                    setForm({ ...form, departmentId: event.target.value })
                                }
                            >
                                <NativeSelectOption value="">Unassigned</NativeSelectOption>
                                {departments.map((department) => (
                                    <NativeSelectOption key={department.id} value={department.id}>
                                        {department.name}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm({ ...form, description: event.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={submitForm}
                            disabled={
                                createCourseMutation.isPending || updateCourseMutation.isPending
                            }
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <RevertPreviewDialog
                open={Boolean(courseToRevert)}
                onOpenChange={(open) => {
                    if (!open) setCourseToRevert(null);
                }}
                title="Revert course override?"
                description="Review the parent template value that will become effective after this local override is removed."
                fields={[
                    {
                        label: 'Code',
                        currentValue: courseToRevert?.code,
                        parentValue: parentCourse?.code,
                    },
                    {
                        label: 'Title',
                        currentValue: courseToRevert?.title,
                        parentValue: parentCourse?.title,
                    },
                    {
                        label: 'Department',
                        currentValue: courseToRevert?.departmentName,
                        parentValue: parentCourse?.departmentName,
                    },
                    {
                        label: 'Description',
                        currentValue: courseToRevert?.description,
                        parentValue: parentCourse?.description,
                    },
                ]}
                isPending={deleteCourseMutation.isPending}
                onConfirm={() => {
                    if (!courseToRevert) return;
                    deleteCourseMutation.mutate(
                        {
                            id: courseToRevert.id,
                            institutionId: selectedInstitutionId || undefined,
                        },
                        {
                            onSuccess: () => setCourseToRevert(null),
                        },
                    );
                }}
            />
            {managedCourseId && (
                <CourseSectionsDialog
                    open={Boolean(managedCourseId)}
                    onOpenChange={(open) => {
                        if (!open) setManagedCourseId(null);
                    }}
                    courseId={managedCourseId}
                    courseTitle={
                        courses.find((c) => c.id === managedCourseId)?.title ?? ''
                    }
                    institutionId={selectedInstitutionId}
                    departments={departments}
                />
            )}
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input value={value} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

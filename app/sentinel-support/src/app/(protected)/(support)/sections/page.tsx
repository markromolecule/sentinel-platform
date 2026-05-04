'use client';

import { OriginStatusBadge, getOriginStatusLabel } from '../_components/origin-status-badge';
import { RevertPreviewDialog } from '../_components/revert-preview-dialog';
import { TemplateContextToolbar } from '../_components/template-context-toolbar';
import {
    isPermissionDeniedError,
    useCoursesQuery,
    useCreateSectionMutation,
    useDebounce,
    useDeleteSectionMutation,
    useDepartmentsQuery,
    useInstitutionsQuery,
    useSectionsQuery,
    useUpdateSectionMutation,
} from '@sentinel/hooks';
import { useEffectiveInstitutionNamingConventionsQuery } from '@sentinel/hooks';
import { Section } from '@sentinel/shared/types';
import { sectionSchema, type SectionFormValues } from '@sentinel/shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
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
    Form,
    NativeSelect,
    NativeSelectOption,
    PageHeader,
    PermissionDeniedState,
    Separator,
} from '@sentinel/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SectionFormFields } from './_components/section-form-fields';

export default function SupportSectionsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
    const [originFilter, setOriginFilter] = useState('ALL');
    const [formOpen, setFormOpen] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [sectionToRevert, setSectionToRevert] = useState<Section | null>(null);

    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema) as Resolver<SectionFormValues>,
        defaultValues: {
            name: '',
            department_id: '',
            course_id: '',
            year_level: undefined,
        },
    });

    const { data: namingConvention } = useEffectiveInstitutionNamingConventionsQuery(
        selectedInstitutionId || '',
    );
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: institutions = [] } = useInstitutionsQuery();
    const selectedInstitution = institutions.find(
        (institution) => institution.id === selectedInstitutionId,
    );
    const parentInstitutionId = selectedInstitution?.parentInstitutionId ?? '';
    const {
        data: sections = [],
        isLoading,
        isError,
        error,
    } = useSectionsQuery(debouncedSearch, selectedInstitutionId || undefined);
    const { data: parentSections = [] } = useSectionsQuery(
        '',
        parentInstitutionId || undefined,
        undefined,
        Boolean(parentInstitutionId),
    );
    const { data: departments = [] } = useDepartmentsQuery('', selectedInstitutionId || undefined);
    const { data: courses = [] } = useCoursesQuery('', selectedInstitutionId || undefined);
    const isViewDenied = isPermissionDeniedError(error, 'sections:view');

    const createSectionMutation = useCreateSectionMutation({
        onSuccess: () => {
            setFormOpen(false);
            form.reset();
        },
    });
    const updateSectionMutation = useUpdateSectionMutation({
        onSuccess: () => {
            setFormOpen(false);
            setEditingSectionId(null);
            form.reset();
        },
    });
    const deleteSectionMutation = useDeleteSectionMutation();

    const filteredSections = useMemo(
        () =>
            sections.filter((section) => {
                if (originFilter === 'ALL') return true;
                return getOriginStatusLabel(section).toUpperCase() === originFilter;
            }),
        [sections, originFilter],
    );
    const parentSection = useMemo(
        () =>
            sectionToRevert?.sourceRecordId
                ? parentSections.find((section) => section.id === sectionToRevert.sourceRecordId)
                : undefined,
        [parentSections, sectionToRevert],
    );

    const columns = useMemo<ColumnDef<Section>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
                cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
            },
            {
                accessorKey: 'yearLevel',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
                cell: ({ row }) => row.original.yearLevel ?? '—',
            },
            {
                id: 'department',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Department" />
                ),
                cell: ({ row }) =>
                    departments.find((department) => department.id === row.original.departmentId)
                        ?.name ?? '—',
            },
            {
                id: 'course',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
                cell: ({ row }) =>
                    courses.find((course) => course.id === row.original.courseId)?.title ?? '—',
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
                                onClick={() => setSectionToRevert(row.original)}
                            >
                                Revert
                            </Button>
                        ) : null}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setEditingSectionId(row.original.id);
                                form.reset({
                                    name: row.original.name,
                                    department_id: row.original.departmentId ?? '',
                                    course_id: row.original.courseId ?? '',
                                    year_level: row.original.yearLevel ?? undefined,
                                });
                                setFormOpen(true);
                            }}
                        >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit section</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (window.confirm(`Delete ${row.original.name}?`)) {
                                    deleteSectionMutation.mutate({
                                        id: row.original.id,
                                        institutionId: selectedInstitutionId || undefined,
                                    });
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete section</span>
                        </Button>
                    </div>
                ),
            },
        ],
        [
            courses,
            deleteSectionMutation,
            departments,
            selectedInstitutionId,
            setSectionToRevert,
            setEditingSectionId,
            form,
            setFormOpen,
        ],
    );

    const onSubmit: SubmitHandler<SectionFormValues> = (values) => {
        const payload = {
            ...values,
            institution_id: selectedInstitutionId || undefined,
        };

        if (editingSectionId) {
            const section = sections.find(s => s.id === editingSectionId);
            if (
                section?.isInherited &&
                !window.confirm(
                    'This inherited section will become a local override for the selected branch context.',
                )
            ) {
                return;
            }

            updateSectionMutation.mutate({ id: editingSectionId, payload });
            return;
        }

        createSectionMutation.mutate(payload);
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title="Section Management" description="Manage template sections.">
                <Button onClick={() => {
                    setEditingSectionId(null);
                    form.reset({
                        name: '',
                        department_id: '',
                        course_id: '',
                        year_level: undefined,
                    });
                    setFormOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Section
                </Button>
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="sections" className="h-[360px]" />
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
                        data={filteredSections}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search sections..."
                        isLoading={isLoading}
                    />
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading sections. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSectionId ? 'Edit Section' : 'Add Section'}</DialogTitle>
                        <DialogDescription>
                            Section changes are scoped to the selected template context.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <SectionFormFields
                                form={form}
                                departments={departments}
                                courses={courses}
                                namingConvention={namingConvention}
                                isPending={createSectionMutation.isPending || updateSectionMutation.isPending}
                                mode={editingSectionId ? 'edit' : 'create'}
                            />
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        createSectionMutation.isPending || updateSectionMutation.isPending
                                    }
                                >
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <RevertPreviewDialog
                open={Boolean(sectionToRevert)}
                onOpenChange={(open) => {
                    if (!open) setSectionToRevert(null);
                }}
                title="Revert section override?"
                description="Review the parent template value that will become effective after this local override is removed."
                fields={[
                    {
                        label: 'Section',
                        currentValue: sectionToRevert?.name,
                        parentValue: parentSection?.name,
                    },
                    {
                        label: 'Year level',
                        currentValue: sectionToRevert?.yearLevel,
                        parentValue: parentSection?.yearLevel,
                    },
                    {
                        label: 'Department',
                        currentValue:
                            departments.find(
                                (department) => department.id === sectionToRevert?.departmentId,
                            )?.name ?? sectionToRevert?.departmentId,
                        parentValue:
                            departments.find(
                                (department) => department.id === parentSection?.departmentId,
                            )?.name ?? parentSection?.departmentId,
                    },
                    {
                        label: 'Course',
                        currentValue:
                            courses.find((course) => course.id === sectionToRevert?.courseId)
                                ?.title ?? sectionToRevert?.courseId,
                        parentValue:
                            courses.find((course) => course.id === parentSection?.courseId)
                                ?.title ?? parentSection?.courseId,
                    },
                ]}
                isPending={deleteSectionMutation.isPending}
                onConfirm={() => {
                    if (!sectionToRevert) return;
                    deleteSectionMutation.mutate(
                        {
                            id: sectionToRevert.id,
                            institutionId: selectedInstitutionId || undefined,
                        },
                        {
                            onSuccess: () => setSectionToRevert(null),
                        },
                    );
                }}
            />
        </div>
    );
}



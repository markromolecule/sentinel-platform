'use client';

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
} from '@sentinel/ui';
import {
    useSectionsQuery,
    useCreateSectionMutation,
    useUpdateSectionMutation,
    useDeleteSectionMutation,
    useEffectiveInstitutionNamingConventionsQuery,
} from '@/data';
import { Section, Department } from '@sentinel/shared/types';
import { sectionSchema, type SectionFormValues } from '@sentinel/shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SectionFormFields } from '@/app/(protected)/(admin)/sections/_components/forms/section-form-fields';
import { ColumnDef } from '@tanstack/react-table';

interface CourseSectionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseTitle: string;
    institutionId: string;
    departments: Department[];
    isReadOnly?: boolean;
}

/**
 * CourseSectionsDialog component that renders a dialog modal listing all sections for a course.
 * Dynamically hides edit, delete, and add operations when isReadOnly is active.
 */
export function CourseSectionsDialog({
    open,
    onOpenChange,
    courseId,
    courseTitle,
    institutionId,
    departments,
    isReadOnly = false,
}: CourseSectionsDialogProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

    const { data: sections = [], isLoading } = useSectionsQuery({
        search: '',
        institutionId,
        courseId,
        enabled: open,
    });

    const { data: namingConvention } = useEffectiveInstitutionNamingConventionsQuery(institutionId);

    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema) as Resolver<SectionFormValues>,
        defaultValues: {
            name: '',
            department_id: '',
            course_id: courseId,
            year_level: undefined,
        },
    });

    const createSectionMutation = useCreateSectionMutation({
        onSuccess: () => {
            setFormOpen(false);
            form.reset({
                name: '',
                department_id: '',
                course_id: courseId,
                year_level: undefined,
            });
        },
    });

    const updateSectionMutation = useUpdateSectionMutation({
        onSuccess: () => {
            setFormOpen(false);
            setEditingSectionId(null);
            form.reset({
                name: '',
                department_id: '',
                course_id: courseId,
                year_level: undefined,
            });
        },
    });

    const deleteSectionMutation = useDeleteSectionMutation();

    const onSubmit: SubmitHandler<SectionFormValues> = (values) => {
        const payload = {
            ...values,
            institution_id: institutionId,
            course_id: courseId,
        };

        if (editingSectionId) {
            updateSectionMutation.mutate({ id: editingSectionId, payload });
        } else {
            createSectionMutation.mutate(payload);
        }
    };

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
            ...(!isReadOnly
                ? [
                      {
                          id: 'actions',
                          cell: ({ row }: { row: { original: Section } }) => (
                              <div className="flex justify-end gap-1">
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                          setEditingSectionId(row.original.id);
                                          form.reset({
                                              name: row.original.name,
                                              department_id: row.original.departmentId ?? '',
                                              course_id: courseId,
                                              year_level: row.original.yearLevel ?? undefined,
                                          });
                                          setFormOpen(true);
                                      }}
                                  >
                                      <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                          if (window.confirm(`Delete ${row.original.name}?`)) {
                                              deleteSectionMutation.mutate({
                                                  id: row.original.id,
                                                  institutionId,
                                              });
                                          }
                                      }}
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [courseId, deleteSectionMutation, form, institutionId, setEditingSectionId, setFormOpen, isReadOnly],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Manage Sections — {courseTitle}</DialogTitle>
                    <DialogDescription>
                        Configure sections specifically for this course program.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {!isReadOnly && (
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                onClick={() => {
                                    setEditingSectionId(null);
                                    form.reset({
                                        name: '',
                                        department_id: '',
                                        course_id: courseId,
                                        year_level: undefined,
                                    });
                                    setFormOpen(true);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Section
                            </Button>
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={sections}
                        isLoading={isLoading}
                        searchPlaceholder="Filter sections..."
                    />
                </div>

                <Dialog open={formOpen} onOpenChange={setFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingSectionId ? 'Edit Section' : 'Add Section'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <SectionFormFields
                                    form={form}
                                    departments={departments}
                                    courses={[]}
                                    namingConvention={namingConvention}
                                    isPending={
                                        createSectionMutation.isPending ||
                                        updateSectionMutation.isPending
                                    }
                                    mode={editingSectionId ? 'edit' : 'create'}
                                    fixedCourseId={courseId}
                                />
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setFormOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            createSectionMutation.isPending ||
                                            updateSectionMutation.isPending
                                        }
                                    >
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

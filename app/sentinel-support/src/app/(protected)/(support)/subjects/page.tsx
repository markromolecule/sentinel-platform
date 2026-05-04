'use client';

import { OriginStatusBadge, getOriginStatusLabel } from '../_components/origin-status-badge';
import { RevertPreviewDialog } from '../_components/revert-preview-dialog';
import { TemplateContextToolbar } from '../_components/template-context-toolbar';
import {
    isPermissionDeniedError,
    useCreateSubjectMutation,
    useDebounce,
    useDeleteSubjectMutation,
    useInstitutionsQuery,
    useSubjectsQuery,
    useUpdateSubjectMutation,
} from '@sentinel/hooks';
import { MasterSubject } from '@sentinel/shared/types';
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
} from '@sentinel/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type SubjectFormState = {
    id?: string;
    code: string;
    title: string;
    isInherited?: boolean;
};

const emptyForm: SubjectFormState = {
    code: '',
    title: '',
};

function getSubjectId(subject: MasterSubject) {
    return subject.id ?? subject.subject_id ?? '';
}

export default function SupportSubjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
    const [originFilter, setOriginFilter] = useState('ALL');
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<SubjectFormState>(emptyForm);
    const [subjectToRevert, setSubjectToRevert] = useState<MasterSubject | null>(null);
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: institutions = [] } = useInstitutionsQuery();
    const selectedInstitution = institutions.find(
        (institution) => institution.id === selectedInstitutionId,
    );
    const parentInstitutionId = selectedInstitution?.parentInstitutionId ?? '';
    const {
        data: subjects = [],
        isLoading,
        isError,
        error,
    } = useSubjectsQuery(debouncedSearch, selectedInstitutionId || undefined);
    const { data: parentSubjects = [] } = useSubjectsQuery(
        undefined,
        parentInstitutionId || undefined,
        Boolean(parentInstitutionId),
    );
    const isViewDenied = isPermissionDeniedError(error, 'subjects:view');

    const createSubjectMutation = useCreateSubjectMutation({
        onSuccess: () => {
            setFormOpen(false);
            setForm(emptyForm);
        },
    });
    const updateSubjectMutation = useUpdateSubjectMutation({
        onSuccess: () => {
            setFormOpen(false);
            setForm(emptyForm);
        },
    });
    const deleteSubjectMutation = useDeleteSubjectMutation();

    const filteredSubjects = useMemo(
        () =>
            subjects.filter((subject) => {
                if (originFilter === 'ALL') return true;
                return getOriginStatusLabel(subject).toUpperCase() === originFilter;
            }),
        [originFilter, subjects],
    );
    const parentSubject = useMemo(
        () =>
            subjectToRevert?.sourceRecordId
                ? parentSubjects.find(
                      (subject) => getSubjectId(subject) === subjectToRevert.sourceRecordId,
                  )
                : undefined,
        [parentSubjects, subjectToRevert],
    );

    const columns = useMemo<ColumnDef<MasterSubject>[]>(
        () => [
            {
                accessorKey: 'code',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
                cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
            },
            {
                accessorKey: 'title',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
            },
            {
                id: 'classifications',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Classifications" />
                ),
                cell: ({ row }) =>
                    row.original.classifications
                        ?.map((classification) => classification.name)
                        .join(', ') || '—',
            },
            {
                id: 'origin',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
                cell: ({ row }) => <OriginStatusBadge record={row.original} />,
            },
            {
                id: 'actions',
                cell: ({ row }) => {
                    const subjectId = getSubjectId(row.original);

                    return (
                        <div className="flex justify-end gap-1">
                            {row.original.isOverridden ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!subjectId}
                                    onClick={() => setSubjectToRevert(row.original)}
                                >
                                    Revert
                                </Button>
                            ) : null}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setForm({
                                        id: subjectId,
                                        code: row.original.code,
                                        title: row.original.title,
                                        isInherited: row.original.isInherited,
                                    });
                                    setFormOpen(true);
                                }}
                            >
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Edit subject</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={!subjectId}
                                onClick={() => {
                                    if (window.confirm(`Delete ${row.original.title}?`)) {
                                        deleteSubjectMutation.mutate({
                                            id: subjectId,
                                            institutionId: selectedInstitutionId || undefined,
                                        });
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete subject</span>
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [deleteSubjectMutation],
    );

    function submitForm() {
        if (!form.code.trim() || !form.title.trim()) return;

        if (form.id) {
            if (
                form.isInherited &&
                !window.confirm(
                    'This inherited subject will become a local override for the selected branch context.',
                )
            ) {
                return;
            }

            updateSubjectMutation.mutate({
                id: form.id,
                payload: {
                    code: form.code.trim(),
                    title: form.title.trim(),
                    institution_id: selectedInstitutionId || undefined,
                },
            });
            return;
        }

        createSubjectMutation.mutate({
            code: form.code.trim(),
            title: form.title.trim(),
            institution_id: selectedInstitutionId || undefined,
        });
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title="Subject Management" description="Manage template subjects.">
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                </Button>
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="subjects" className="h-[360px]" />
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
                        data={filteredSubjects}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search subjects..."
                        isLoading={isLoading}
                    />
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading subjects. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{form.id ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
                        <DialogDescription>
                            Subject changes are scoped to the selected template context.
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={submitForm}
                            disabled={
                                createSubjectMutation.isPending || updateSubjectMutation.isPending
                            }
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <RevertPreviewDialog
                open={Boolean(subjectToRevert)}
                onOpenChange={(open) => {
                    if (!open) setSubjectToRevert(null);
                }}
                title="Revert subject override?"
                description="Review the parent template value that will become effective after this local override is removed."
                fields={[
                    {
                        label: 'Code',
                        currentValue: subjectToRevert?.code,
                        parentValue: parentSubject?.code,
                    },
                    {
                        label: 'Title',
                        currentValue: subjectToRevert?.title,
                        parentValue: parentSubject?.title,
                    },
                    {
                        label: 'Classifications',
                        currentValue: subjectToRevert?.classifications
                            ?.map((classification) => classification.name)
                            .join(', '),
                        parentValue: parentSubject?.classifications
                            ?.map((classification) => classification.name)
                            .join(', '),
                    },
                ]}
                isPending={deleteSubjectMutation.isPending}
                onConfirm={() => {
                    if (!subjectToRevert) return;
                    const subjectId = getSubjectId(subjectToRevert);
                    if (!subjectId) return;

                    deleteSubjectMutation.mutate(
                        {
                            id: subjectId,
                            institutionId: selectedInstitutionId || undefined,
                        },
                        {
                            onSuccess: () => setSubjectToRevert(null),
                        },
                    );
                }}
            />
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

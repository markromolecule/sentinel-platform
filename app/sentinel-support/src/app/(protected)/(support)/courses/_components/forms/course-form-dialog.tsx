'use client';

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
    NativeSelect,
    NativeSelectOption,
    Textarea,
} from '@sentinel/ui';
import { Department } from '@sentinel/shared/types';
import { CourseFormState } from '@/app/(protected)/(support)/courses/_hooks/use-courses-page-state/_types';

export type CourseFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: CourseFormState;
    setForm: (form: CourseFormState) => void;
    departments: Department[];
    onSubmit: () => void;
    isPending: boolean;
};

export function CourseFormDialog({
    open,
    onOpenChange,
    form,
    setForm,
    departments,
    onSubmit,
    isPending,
}: CourseFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{form.id ? 'Edit Course' : 'Add Course'}</DialogTitle>
                    <DialogDescription>
                        Course changes are scoped to the selected template context.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Input
                            value={form.code}
                            onChange={(event) => setForm({ ...form, code: event.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={form.title}
                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                        />
                    </div>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isPending}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

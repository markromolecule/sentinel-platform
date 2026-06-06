'use client';

import { useDepartmentsQuery, useCoursesQuery } from '@sentinel/hooks';
import { Department, Course } from '@sentinel/shared/types';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    Badge,
} from '@sentinel/ui';
import { Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useBulkSectionForm } from '../../_hooks/use-bulk-section-form';

/**
 * BulkCreateSectionsDialog renders a dialog with a button launcher that allows administrators
 * to bulk upload multiple sections at once via CSV/pasted manual text.
 * It is pre-scoped to the active administrator's institution, hiding the target institution selection.
 */
export function BulkCreateSectionsDialog() {
    const [open, setOpen] = useState(false);
    const { institutionId } = useAcademicScope();

    const {
        departmentId,
        setDepartmentId,
        courseId,
        setCourseId,
        input,
        setInput,
        preview,
        onSubmit,
        isPending,
    } = useBulkSectionForm(institutionId, () => setOpen(false));

    // Fetch departments and courses scoped to the institution
    const { data: departments = [] } = useDepartmentsQuery({
        institutionId: institutionId || undefined,
        enabled: Boolean(institutionId),
    });

    const { data: courses = [] } = useCoursesQuery({
        institutionId: institutionId || undefined,
        enabled: Boolean(institutionId),
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[800px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Bulk Create Sections</DialogTitle>
                    <DialogDescription>
                        Paste section names and year levels to create multiple records at once for
                        your institution.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Department (Optional)</Label>
                            <Select
                                disabled={isPending || !institutionId}
                                onValueChange={(val) =>
                                    setDepartmentId(val === 'none' ? null : val)
                                }
                                value={departmentId ?? 'none'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {departments.map((dept: Department) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Course (Optional)</Label>
                            <Select
                                disabled={isPending || !institutionId}
                                onValueChange={(val) => setCourseId(val === 'none' ? null : val)}
                                value={courseId ?? 'none'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {courses.map((c: Course) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Sections (CSV Format)</Label>
                            <p className="text-muted-foreground text-[10px]">
                                Format: Name, Year Level (one per line)
                            </p>
                            <Textarea
                                placeholder="INF231, 3&#10;INF232, 3"
                                className="h-[300px] font-mono text-sm"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isPending}
                            />
                        </div>

                        <div className="border-border bg-muted/30 flex flex-col rounded-md border">
                            <div className="flex items-center justify-between border-b px-4 py-2">
                                <span className="text-xs font-medium">Preview</span>
                                <Badge variant="secondary">{preview.rows.length} rows</Badge>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                {preview.rows.length > 0 ? (
                                    <div className="space-y-2">
                                        {preview.rows.map((row, i) => (
                                            <div
                                                key={i}
                                                className="border-border/50 flex items-center justify-between gap-2 border-b pb-2 text-xs"
                                            >
                                                <span className="text-foreground font-medium">
                                                    {row.name}
                                                </span>
                                                <span className="text-muted-foreground font-mono">
                                                    Year {row.year_level || 'N/A'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center text-xs">
                                        <AlertCircle className="h-8 w-8 opacity-20" />
                                        <p>No valid rows detected yet.</p>
                                    </div>
                                )}

                                {preview.errors.length > 0 && (
                                    <div className="mt-4 space-y-1">
                                        {preview.errors.map((error, i) => (
                                            <p key={i} className="text-destructive text-[10px]">
                                                {error}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isPending || preview.rows.length === 0}
                        className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                    >
                        {isPending ? 'Creating...' : `Create ${preview.rows.length} Sections`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

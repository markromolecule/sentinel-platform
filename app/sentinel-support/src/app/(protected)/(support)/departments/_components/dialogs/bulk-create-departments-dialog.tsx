'use client';

import { useInstitutionsQuery, useActivePermissions } from '@sentinel/hooks';
import { Institution } from '@sentinel/shared/types';
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
import { useState, useEffect } from 'react';
import { useBulkDepartmentForm } from '../../_hooks/use-bulk-department-form';

export type BulkCreateDepartmentsDialogProps = {
    defaultInstitutionId?: string;
};

export function BulkCreateDepartmentsDialog({
    defaultInstitutionId,
}: BulkCreateDepartmentsDialogProps) {
    const { hasPermission } = useActivePermissions();
    const [open, setOpen] = useState(false);
    const { data: institutions = [] } = useInstitutionsQuery();
    const { institutionId, setInstitutionId, input, setInput, preview, onSubmit, isPending } =
        useBulkDepartmentForm(() => setOpen(false));

    useEffect(() => {
        if (defaultInstitutionId && defaultInstitutionId !== 'all') {
            setInstitutionId(defaultInstitutionId);
        }
    }, [defaultInstitutionId, setInstitutionId]);

    if (!hasPermission('departments:create')) {
        return null;
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[700px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Bulk Create Departments</DialogTitle>
                    <DialogDescription>
                        Paste department names and codes to create multiple records at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label>Target Institution</Label>
                        <Select
                            disabled={isPending}
                            onValueChange={setInstitutionId}
                            value={institutionId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select institution" />
                            </SelectTrigger>
                            <SelectContent>
                                {institutions.map((institution: Institution) => (
                                    <SelectItem key={institution.id} value={institution.id}>
                                        {institution.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Departments (CSV Format)</Label>
                            <p className="text-muted-foreground text-[10px]">
                                Format: Name, Code (one per line)
                            </p>
                            <Textarea
                                placeholder="School of Engineering, SOE&#10;College of Arts, CAS"
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
                                                <span className="font-medium">{row.name}</span>
                                                <span className="text-muted-foreground font-mono">
                                                    {row.code}
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
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        {isPending ? 'Creating...' : `Create ${preview.rows.length} Departments`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

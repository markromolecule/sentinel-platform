import * as React from 'react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { Loader2 } from 'lucide-react';
import { PRESET_OPTIONS } from '../_constants';
import { QueueReportDialogProps } from './_types';

/**
 * QueueReportDialog is a pure UI dialog component allowing users to configure
 * and request the generation of an overall analytics report.
 */
export function QueueReportDialog({
    isOpen,
    onOpenChange,
    title,
    onTitleChange,
    selectedInstitutionId,
    onInstitutionChange,
    preset,
    onPresetChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    validationErrors,
    availableInstitutions,
    isInstitutionLocked,
    scopedInstitutionId,
    onSubmit,
    isPending,
}: QueueReportDialogProps) {
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Queue Overall Report</DialogTitle>
                    <DialogDescription>
                        Choose the target institution and period for the PDF export. The report
                        will be generated asynchronously.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid gap-4 py-2 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="report-title">Title</Label>
                            <Input
                                id="report-title"
                                value={title}
                                onChange={(event) => onTitleChange(event.target.value)}
                                placeholder="Overall Analytics Report"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-institution">Institution</Label>
                            <Select
                                value={selectedInstitutionId}
                                onValueChange={onInstitutionChange}
                                disabled={isInstitutionLocked}
                            >
                                <SelectTrigger id="dialog-institution">
                                    <SelectValue placeholder="Choose an institution" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableInstitutions.map((institution) => (
                                        <SelectItem key={institution.id} value={institution.id}>
                                            {institution.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-xs leading-5">
                                {isInstitutionLocked
                                    ? 'Your assigned branch scope is applied automatically.'
                                    : scopedInstitutionId
                                      ? 'Choose from your assigned parent institution and its branches.'
                                      : 'You can oversee and generate reports across all institutions and branches.'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-period-preset">Period</Label>
                            <Select
                                value={preset}
                                onValueChange={(value) => onPresetChange(value as any)}
                            >
                                <SelectTrigger id="dialog-period-preset">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRESET_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {preset === 'CUSTOM' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="report-start-date">Start date</Label>
                                    <Input
                                        id="report-start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(event) => onStartDateChange(event.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="report-end-date">End date</Label>
                                    <Input
                                        id="report-end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(event) => onEndDateChange(event.target.value)}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>

                    {validationErrors.length > 0 ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <p className="font-medium">Please fix the following:</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                {validationErrors.map((error) => (
                                    <li key={error}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Queueing...
                                </>
                            ) : (
                                'Queue report'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { MoreHorizontal, Trash2, Copy } from "lucide-react";
import { type Subject } from "@sentinel/shared/types";
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@sentinel/ui";
import { toast } from "sonner";
import { useUnenrollment } from "@/app/(protected)/(instructor)/subjects/_hooks/use-unenrollment";
import { UnenrollSubjectDialog } from "@/app/(protected)/(instructor)/subjects/_components/dialogs/unenroll-subject-dialog";

interface SubjectActionsCellProps {
    subject: Subject;
}

export function SubjectActionsCell({ subject }: SubjectActionsCellProps) {
    const subjectOfferingId = subject.subjectOfferingId;

    const {
        open,
        allSections,
        selectedSectionIds,
        isPending,
        toggleSection,
        toggleAll,
        handleUnenroll,
        handleOpenChange,
    } = useUnenrollment({ subject });

    const copyToClipboard = (text: string, description: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${description} copied to clipboard`);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => copyToClipboard(subject.code, "Subject code")}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy subject code
                    </DropdownMenuItem>
                    {subjectOfferingId && (
                        <DropdownMenuItem onClick={() => copyToClipboard(subjectOfferingId, "Offered subject ID")}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy offered subject ID
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => handleOpenChange(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Unenroll Subject
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <UnenrollSubjectDialog
                open={open}
                onOpenChange={handleOpenChange}
                subject={subject}
                allSections={allSections}
                selectedSectionIds={selectedSectionIds}
                onToggleSection={toggleSection}
                onToggleAll={toggleAll}
                onUnenroll={handleUnenroll}
                isPending={isPending}
            />
        </>
    );
}

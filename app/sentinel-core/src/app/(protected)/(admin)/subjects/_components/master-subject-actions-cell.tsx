"use client";

import { useDeleteSubjectMutation } from "@sentinel/hooks";
import { useState } from "react";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { type MasterSubject } from "@sentinel/shared/types";
import { EditSubjectDialog } from "@/app/(protected)/(admin)/subjects/_components/edit-subject-dialog";
import { Button } from "@sentinel/ui";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";

interface MasterSubjectActionsCellProps {
    subject: MasterSubject;
}

export function MasterSubjectActionsCell({ subject }: MasterSubjectActionsCellProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteSubject = useDeleteSubjectMutation();
    const subjectId = subject.id;

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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subject.code)}>
                        Copy subject code
                    </DropdownMenuItem>
                    {subjectId && (
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subjectId)}>
                            Copy subject ID
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            if (subjectId) {
                                setDeleteOpen(true);
                            }
                        }}
                        disabled={!subjectId}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Subject
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditSubjectDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                subjectToEdit={subject}
            />

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="animate-none data-[state=open]:animate-none data-[state=closed]:animate-none duration-0 transition-none">
                    <DialogHeader>
                        <DialogTitle>Delete Subject?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete
                            &quot;{subject.code} - {subject.title}&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleteSubject.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (!subjectId) {
                                    return;
                                }

                                deleteSubject.mutate(subjectId, {
                                    onSuccess: () => setDeleteOpen(false),
                                });
                            }}
                            disabled={!subjectId || deleteSubject.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteSubject.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

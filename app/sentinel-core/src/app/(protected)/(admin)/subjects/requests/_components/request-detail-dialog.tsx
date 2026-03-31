"use client";

import { EnrollmentRequest } from "@sentinel/shared/types";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle,
    Badge,
    Button,
    Separator
} from "@sentinel/ui";
import { useApproveEnrollmentMutation, useRejectEnrollmentMutation } from "@sentinel/hooks";
import { Check, X, Calendar, User, BookOpen, Layers, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface RequestDetailDialogProps {
    request: EnrollmentRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RequestDetailDialog({ request, open, onOpenChange }: RequestDetailDialogProps) {
    const { mutate: approve, isPending: isApproving } = useApproveEnrollmentMutation();
    const { mutate: reject, isPending: isRejecting } = useRejectEnrollmentMutation();

    if (!request) return null;

    const requestIds = request.sections.map(s => s.request_id);

    const handleApprove = () => {
        approve(requestIds, {
            onSuccess: () => onOpenChange(false),
        });
    };

    const handleReject = () => {
        reject(requestIds, {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Enrollment Request Details
                    </DialogTitle>
                    <DialogDescription>
                        Review the offered-subject enrollment details submitted by the instructor.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Instructor Info */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium leading-none">Instructor</p>
                            <p className="text-sm text-muted-foreground mt-1">{request.instructor_name}</p>
                        </div>
                        <Badge variant={
                            request.status === 'PENDING' ? 'secondary' : 
                            request.status === 'APPROVED' ? 'default' : 
                            'destructive'
                        }>
                            {request.status}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Subject Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">Subject</p>
                                <p className="text-sm text-muted-foreground mt-1 font-mono">{request.subject_code}</p>
                                <p className="text-xs text-muted-foreground">{request.subject_title}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">Term</p>
                                <p className="text-sm text-muted-foreground mt-1">{request.term_academic_year}</p>
                                <p className="text-xs text-muted-foreground">{request.term_semester}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Layers className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">Course</p>
                                <p className="text-sm text-muted-foreground mt-1">{request.course_title || "N/A"}</p>
                                <p className="text-xs text-muted-foreground">{request.department_name}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Sections */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium flex items-center gap-2">
                            Requested Sections ({request.sections.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {request.sections.map((section) => (
                                <Badge key={section.request_id} variant="secondary">
                                    {section.section_name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        Requested on {request.created_at ? format(new Date(request.created_at), "PPP p") : "N/A"}
                    </div>
                </div>

                {request.status === 'PENDING' && (
                    <div className="flex justify-end gap-3 mt-4">
                        <Button 
                            variant="outline" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={handleReject}
                            disabled={isRejecting || isApproving}
                        >
                            {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                            Reject All
                        </Button>
                        <Button 
                            onClick={handleApprove}
                            disabled={isRejecting || isApproving}
                        >
                            {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Approve All
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
